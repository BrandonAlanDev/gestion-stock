import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { Prisma, PrismaClient } from "../generated/prisma/client";
import {
  compararTablasOrigen,
  MANIFIESTO_TABLAS_TENANT,
  validarManifiestoTablasTenant,
} from "../src/lib/tenants/migracion-datos/manifiesto";
import {
  obtenerRelacionesForaneasTenant,
  validarRelacionesForaneasTenant,
} from "../src/lib/tenants/migracion-datos/relaciones";
import {
  auditarRelacionesTenant,
  type ColumnaAuditoriaOrigen,
  type ConteoRelacionTenant,
} from "./tenants/auditar-relaciones-origen";

interface ConfiguracionOrigen {
  host: string;
  puerto: number;
  usuario: string;
  contrasena: string;
  base: string;
  ssl: boolean;
  tenantIds: string[];
}

interface ConteoPorTenant {
  tenantId: string | null;
  total: bigint;
}

function variableRequerida(nombre: string): string {
  const valor = process.env[nombre]?.trim();
  if (!valor) throw new Error(`Falta la variable requerida ${nombre}`);
  return valor;
}

function leerConfiguracion(): ConfiguracionOrigen {
  if (process.env.NODE_ENV === "production") {
    throw new Error("El inventario de origen solo se permite fuera de producción");
  }
  if (process.env.TENANT_SOURCE_INVENTORY_MODE !== "1") {
    throw new Error("Definí TENANT_SOURCE_INVENTORY_MODE=1 para habilitar el inventario");
  }
  if (process.env.TENANT_SOURCE_INVENTORY_READ_ONLY_ACK !== "1") {
    throw new Error("Confirmá que el usuario MySQL configurado tiene permisos de solo lectura");
  }

  const host = variableRequerida("TENANT_SOURCE_DB_HOST");
  const puertoTexto = variableRequerida("TENANT_SOURCE_DB_PORT");
  const puerto = Number(puertoTexto);
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error("TENANT_SOURCE_DB_PORT debe ser un puerto válido");
  }

  const base = variableRequerida("TENANT_SOURCE_DB_NAME");
  const tenantIds = [...new Set(
    variableRequerida("TENANT_SOURCE_INVENTORY_TENANT_IDS")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  )];
  if (tenantIds.length === 0 || tenantIds.length > 100) {
    throw new Error("Indicá entre 1 y 100 tenant IDs para el inventario");
  }
  if (tenantIds.some((id) => !/^[a-z0-9_-]{1,128}$/i.test(id))) {
    throw new Error("La lista contiene un tenant ID inválido");
  }

  const sslTexto = variableRequerida("TENANT_SOURCE_DB_SSL");
  if (sslTexto !== "0" && sslTexto !== "1") {
    throw new Error("TENANT_SOURCE_DB_SSL debe ser 1 o 0");
  }

  const confirmacionEsperada = `${host}:${puerto}/${base}|${tenantIds.join(",")}`;
  if (process.env.TENANT_SOURCE_INVENTORY_CONFIRM !== confirmacionEsperada) {
    throw new Error(
      "TENANT_SOURCE_INVENTORY_CONFIRM debe repetir host, puerto, base y tenant IDs seleccionados",
    );
  }

  return {
    host,
    puerto,
    usuario: variableRequerida("TENANT_SOURCE_DB_USER"),
    contrasena: variableRequerida("TENANT_SOURCE_DB_PASSWORD"),
    base,
    ssl: sslTexto === "1",
    tenantIds,
  };
}

function identificadorSql(valor: string): Prisma.Sql {
  if (!/^[a-zA-Z0-9_$]+$/.test(valor)) {
    throw new Error("El servidor devolvió un identificador SQL inválido");
  }
  return Prisma.raw(`\`${valor}\``);
}

function numero(valor: bigint | number | null): number {
  return valor === null ? 0 : Number(valor);
}

async function main(): Promise<void> {
  const configuracion = leerConfiguracion();
  const schema = await readFile(path.resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
  const erroresManifiesto = validarManifiestoTablasTenant(schema);
  const erroresRelaciones = validarRelacionesForaneasTenant(schema);
  if (erroresManifiesto.length > 0 || erroresRelaciones.length > 0) {
    throw new Error(
      `Revisá los manifiestos de migración: ${[...erroresManifiesto, ...erroresRelaciones].join("; ")}`,
    );
  }
  const relacionesSchema = obtenerRelacionesForaneasTenant(schema);
  const adaptador = new PrismaMariaDb({
    host: configuracion.host,
    port: configuracion.puerto,
    user: configuracion.usuario,
    password: configuracion.contrasena,
    database: configuracion.base,
    ssl: configuracion.ssl ? { rejectUnauthorized: true } : false,
    connectionLimit: 1,
    connectTimeout: 10_000,
  });
  const cliente = new PrismaClient({ adapter: adaptador });

  try {
    await cliente.$connect();
    const [identidad] = await cliente.$queryRaw<Array<{
      servidor: string;
      puerto: number;
      base: string | null;
    }>>`
      SELECT @@hostname AS servidor, @@port AS puerto, DATABASE() AS base
    `;
    if (!identidad?.base) throw new Error("No se pudo identificar la base de origen");
    if (identidad.base.toLowerCase() !== configuracion.base.toLowerCase()) {
      throw new Error("La base efectiva no coincide con la confirmación del inventario");
    }

    const columnas = await cliente.$queryRaw<ColumnaAuditoriaOrigen[]>`
      SELECT
        TABLE_NAME AS tabla,
        COLUMN_NAME AS columna,
        COLUMN_TYPE AS tipo,
        IS_NULLABLE AS nullable,
        CAST(COLUMN_DEFAULT AS CHAR) AS predeterminado,
        COLUMN_KEY AS clave,
        EXTRA AS extra
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN (
          SELECT TABLE_NAME FROM information_schema.TABLES
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
        )
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `;
    const indices = await cliente.$queryRaw<Array<{
      tabla: string;
      indice: string;
      unico: number;
      posicion: number;
      columna: string | null;
      prefijo: number | null;
      tipo: string;
    }>>`
      SELECT
        TABLE_NAME AS tabla,
        INDEX_NAME AS indice,
        NON_UNIQUE AS unico,
        SEQ_IN_INDEX AS posicion,
        COLUMN_NAME AS columna,
        SUB_PART AS prefijo,
        INDEX_TYPE AS tipo
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
    `;

    const columnasPorTabla = new Map<string, ColumnaAuditoriaOrigen[]>();
    for (const columna of columnas) {
      const lista = columnasPorTabla.get(columna.tabla) ?? [];
      lista.push(columna);
      columnasPorTabla.set(columna.tabla, lista);
    }

    const tablas: Array<Record<string, unknown>> = [];
    for (const [nombre, columnasTabla] of columnasPorTabla) {
      const createRows = await cliente.$queryRaw<Array<Record<string, string>>>(
        Prisma.sql`SHOW CREATE TABLE ${identificadorSql(nombre)}`,
      );
      const ddl = createRows[0] ? Object.values(createRows[0])[1] ?? null : null;
      const columnasTenant = columnasTabla.some((columna) => columna.columna === "tenantId");

      if (columnasTenant) {
        const conteos = await cliente.$queryRaw<ConteoPorTenant[]>(Prisma.sql`
          SELECT CAST(${identificadorSql(nombre)}.${identificadorSql("tenantId")} AS CHAR) AS tenantId,
                 COUNT(*) AS total
          FROM ${identificadorSql(nombre)}
          GROUP BY ${identificadorSql(nombre)}.${identificadorSql("tenantId")}
          ORDER BY tenantId
        `);
        const idsSolicitados = new Set(configuracion.tenantIds);
        const conteosSeleccionados = conteos.filter((fila) =>
          fila.tenantId !== null && idsSolicitados.has(fila.tenantId),
        );
        const filasSinTenant = conteos
          .filter((fila) => fila.tenantId === null)
          .reduce((total, fila) => total + numero(fila.total), 0);
        const filasDeOtrosTenants = conteos
          .filter((fila) => fila.tenantId !== null && !idsSolicitados.has(fila.tenantId))
          .reduce((total, fila) => total + numero(fila.total), 0);
        tablas.push({
          tabla: nombre,
          ddl,
          columnas: columnasTabla,
          tieneTenantId: true,
          conteosPorTenant: conteosSeleccionados.map((fila) => ({
            tenantId: fila.tenantId,
            total: numero(fila.total),
          })),
          filasConTenantIdNulo: filasSinTenant,
          filasDeTenantsNoSeleccionados: filasDeOtrosTenants,
        });
      } else {
        const [conteo] = await cliente.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`
          SELECT COUNT(*) AS total FROM ${identificadorSql(nombre)}
        `);
        tablas.push({
          tabla: nombre,
          ddl,
          columnas: columnasTabla,
          tieneTenantId: false,
          totalSinSegmentacionAutomatica: numero(conteo?.total ?? BigInt(0)),
          requiereMapeoManual: nombre !== "_prisma_migrations",
        });
      }
    }

    const nombresTablas = new Set(columnasPorTabla.keys());
    const coberturaTablas = compararTablasOrigen([...nombresTablas]);
    const tablaTenant = MANIFIESTO_TABLAS_TENANT.find((tabla) => tabla.modelo === "Tenant")?.tabla;
    const idsTenantEncontrados = tablaTenant && nombresTablas.has(tablaTenant)
      ? await cliente.$queryRaw<Array<{ id: string }>>(Prisma.sql`
          SELECT CAST(${identificadorSql("id")} AS CHAR) AS id
          FROM ${identificadorSql(tablaTenant)}
          WHERE ${identificadorSql("id")} IN (${Prisma.join(configuracion.tenantIds)})
        `)
      : [];
    const idsEncontrados = new Set(idsTenantEncontrados.map((fila) => fila.id));
    const tenantsOrigen = configuracion.tenantIds.map((tenantId) => ({
      tenantId,
      existe: idsEncontrados.has(tenantId),
    }));
    const auditoriaRelaciones = await auditarRelacionesTenant(
      (consulta) => cliente.$queryRaw<ConteoRelacionTenant[]>(consulta),
      configuracion.tenantIds,
      columnasPorTabla,
      relacionesSchema,
    );
    let puentesVariantes: Record<string, number> | null = null;
    if (
      nombresTablas.has("GarmentVariantOptionValue") &&
      nombresTablas.has("GarmentVariant") &&
      nombresTablas.has("GarmentOptionValue")
    ) {
      const [puente] = await cliente.$queryRaw<Array<{
        total: bigint;
        variantesHuerfanas: bigint;
        opcionesHuerfanas: bigint;
        tenantsCruzados: bigint;
      }>>`
        SELECT
          COUNT(*) AS total,
          COALESCE(SUM(v.id IS NULL), 0) AS variantesHuerfanas,
          COALESCE(SUM(ov.id IS NULL), 0) AS opcionesHuerfanas,
          COALESCE(SUM(v.id IS NOT NULL AND ov.id IS NOT NULL AND v.tenantId <> ov.tenantId), 0) AS tenantsCruzados
        FROM GarmentVariantOptionValue b
        LEFT JOIN GarmentVariant v ON v.id = b.variantId
        LEFT JOIN GarmentOptionValue ov ON ov.id = b.optionValueId
      `;
      puentesVariantes = {
        total: numero(puente?.total ?? BigInt(0)),
        variantesHuerfanas: numero(puente?.variantesHuerfanas ?? BigInt(0)),
        opcionesHuerfanas: numero(puente?.opcionesHuerfanas ?? BigInt(0)),
        tenantsCruzados: numero(puente?.tenantsCruzados ?? BigInt(0)),
      };
    }

    let migraciones: Array<{
      migration_name: string;
      checksum: string;
      started_at: Date;
      finished_at: Date | null;
      rolled_back_at: Date | null;
      applied_steps_count: number;
    }> | null = null;
    if (nombresTablas.has("_prisma_migrations")) {
      migraciones = await cliente.$queryRaw`
        SELECT migration_name, checksum, started_at, finished_at,
               rolled_back_at, applied_steps_count
        FROM _prisma_migrations
        ORDER BY started_at, migration_name
      `;
    }

    console.log(JSON.stringify({
      soloLectura: true,
      destinoConfirmado: `${configuracion.host}:${configuracion.puerto}/${configuracion.base}`,
      identidadMySQL: identidad,
      tenantIdsSolicitados: configuracion.tenantIds,
      columnas,
      indices,
      tablas,
      coberturaTablas,
      tenantsOrigen,
      relacionesSchema,
      auditoriaRelaciones,
      puentesVariantes,
      migraciones,
      observacion: "El informe no copia filas; una tabla no clasificada/ausente, un tenant inexistente, una relación inválida/no evaluable o un puente huérfano/cruzado bloquea la copia hasta resolverlo.",
    }, null, 2));
  } finally {
    await cliente.$disconnect();
  }
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
