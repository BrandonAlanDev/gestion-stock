import "dotenv/config";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { conPrismaTenant, invalidarClientesPrismaTenant } from "../src/lib/tenants/prisma-factory";
import { obtenerProveedorRegistroTenant } from "../src/lib/tenants/registry/proveedor-registro";
import type { CredencialesBaseTenant } from "../src/lib/tenants/registry/types";
import { construirUrlMysql } from "./tenants/crear-url-mysql";
import { coincideHistorialMigraciones } from "./tenants/comparar-migraciones";

interface ColumnaEsquema {
  tabla: string;
  columna: string;
  tipo: string;
  nullable: string;
  predeterminado: string;
  clave: string;
  extra: string;
}

interface TablaEsquema {
  tabla: string;
  tipo: string;
  motor: string | null;
}

interface IndiceEsquema {
  tabla: string;
  indice: string;
  unico: number;
  posicion: number;
  columna: string | null;
  prefijo: number | null;
  tipo: string;
}

interface ResultadoSilo {
  tenantId: string;
  referenciaBase: string;
  servidor: string;
  puertoServidor: number;
  base: string;
  tablas: TablaEsquema[];
  columnas: ColumnaEsquema[];
  indices: IndiceEsquema[];
  migraciones: Array<{ nombre: string; checksum: string }>;
}

interface MigracionEsperada {
  nombre: string;
  checksum: string;
}

async function obtenerMigracionesDelRepositorio(): Promise<MigracionEsperada[]> {
  const directorio = path.join(process.cwd(), "prisma", "migrations");
  const entradas = await readdir(directorio, { withFileTypes: true });
  const nombres = entradas
    .filter((entrada) => entrada.isDirectory())
    .map((entrada) => entrada.name)
    .sort();
  return Promise.all(nombres.map(async (nombre) => {
    const contenido = await readFile(path.join(directorio, nombre, "migration.sql"));
    return {
      nombre,
      checksum: createHash("sha256").update(contenido).digest("hex"),
    };
  }));
}

function verificarEsquemaContraPrisma(
  tenantId: string,
  credenciales: CredencialesBaseTenant,
): void {
  const requireDesdeProyecto = createRequire(path.join(process.cwd(), "package.json"));
  const rutaPaquetePrisma = requireDesdeProyecto.resolve("prisma/package.json");
  const prismaCli = path.join(path.dirname(rutaPaquetePrisma), "build", "index.js");
  const env = { ...process.env, DATABASE_URL: construirUrlMysql(credenciales) };

  try {
    execFileSync(process.execPath, [
      prismaCli,
      "migrate",
      "diff",
      "--from-config-datasource",
      "--to-schema",
      "prisma/schema.prisma",
      "--exit-code",
    ], {
      cwd: process.cwd(),
      env,
      stdio: "ignore",
      windowsHide: true,
    });
  } catch (error) {
    const codigo = typeof error === "object" && error !== null && "status" in error
      ? error.status
      : undefined;
    if (codigo === 2) {
      throw new Error(`El esquema del tenant ${tenantId} difiere de prisma/schema.prisma`);
    }
    throw new Error(`No se pudo comparar el esquema de Prisma del tenant ${tenantId}`);
  }
}

async function inspeccionarSilo(tenantId: string): Promise<ResultadoSilo> {
  const registro = obtenerProveedorRegistroTenant();
  const entry = await registro.resolverPorId(tenantId);
  if (!entry || entry.tenant.estado !== "ACTIVO") {
    throw new Error(`El tenant de prueba ${tenantId} no está activo en el registro`);
  }
  const credenciales = await registro.resolverCredenciales(
    entry.referenciaBase,
    entry.versionCredenciales,
    entry.tenant.id,
  );
  verificarEsquemaContraPrisma(tenantId, credenciales);
  for (const dominio of entry.dominios) {
    const tenantPorDominio = await registro.resolverPorHostname(dominio);
    if (tenantPorDominio?.tenant.id !== tenantId) {
      throw new Error(`El dominio ${dominio} no resuelve al tenant de prueba esperado`);
    }
  }

  return conPrismaTenant(tenantId, async (cliente) => {
    const [resultadoBase] = await cliente.$queryRaw<Array<{
      servidor: string;
      puerto: number;
      base: string | null;
    }>>`
      SELECT @@hostname AS servidor, @@port AS puerto, DATABASE() AS base
    `;
    if (!resultadoBase?.base) throw new Error(`No se pudo identificar la base del tenant ${tenantId}`);

    const columnas = await cliente.$queryRaw<ColumnaEsquema[]>`
      SELECT
        TABLE_NAME AS tabla,
        COLUMN_NAME AS columna,
        COLUMN_TYPE AS tipo,
        IS_NULLABLE AS nullable,
        COALESCE(CAST(COLUMN_DEFAULT AS CHAR), '__NULL__') AS predeterminado,
        COLUMN_KEY AS clave,
        EXTRA AS extra
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `;
    const tablas = await cliente.$queryRaw<TablaEsquema[]>`
      SELECT TABLE_NAME AS tabla, TABLE_TYPE AS tipo, ENGINE AS motor
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `;
    const indices = await cliente.$queryRaw<IndiceEsquema[]>`
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
    const filasMigracion = await cliente.$queryRaw<Array<{
      migration_name: string;
      checksum: string;
      finished_at: Date | null;
      rolled_back_at: Date | null;
    }>>`
      SELECT migration_name, checksum, finished_at, rolled_back_at
      FROM _prisma_migrations
      ORDER BY migration_name
    `;

    const migracionIncompleta = filasMigracion.find(
      (fila) => fila.finished_at === null && fila.rolled_back_at === null,
    );
    if (migracionIncompleta) {
      throw new Error(`El tenant ${tenantId} tiene una migración incompleta: ${migracionIncompleta.migration_name}`);
    }
    const migraciones = filasMigracion
      .filter((fila) => fila.finished_at !== null && fila.rolled_back_at === null)
      .map((fila) => ({ nombre: fila.migration_name, checksum: fila.checksum }))
      .sort();

    if (columnas.length === 0 || tablas.length === 0 || migraciones.length === 0) {
      throw new Error(`La base de prueba ${tenantId} no tiene un esquema Prisma aplicado`);
    }
    return {
      tenantId,
      referenciaBase: entry.referenciaBase,
      servidor: resultadoBase.servidor,
      puertoServidor: Number(resultadoBase.puerto),
      base: resultadoBase.base,
      tablas,
      columnas,
      indices,
      migraciones,
    };
  });
}

async function main(): Promise<void> {
  if (process.env.TENANT_SILO_TEST_MODE !== "1" || process.env.NODE_ENV === "production") {
    throw new Error("La comprobación requiere TENANT_SILO_TEST_MODE=1 en un entorno de prueba descartable");
  }

  const tenantIds = [...new Set(
    (process.env.TENANT_SILO_TEST_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean),
  )];
  if (tenantIds.length < 2) throw new Error("Definí al menos dos IDs en TENANT_SILO_TEST_IDS");

  try {
    const [silos, migracionesEsperadas] = await Promise.all([
      Promise.all(tenantIds.map(inspeccionarSilo)),
      obtenerMigracionesDelRepositorio(),
    ]);
    const bases = new Set(silos.map((silo) =>
      `${silo.servidor.toLowerCase()}:${silo.puertoServidor}/${silo.base.toLowerCase()}`,
    ));
    const referencias = new Set(silos.map((silo) => silo.referenciaBase));
    if (bases.size !== silos.length || referencias.size !== silos.length) {
      throw new Error("Dos tenants de prueba resuelven a la misma base o referencia de conexión");
    }

    const esquemaEsperado = JSON.stringify({
      tablas: silos[0]?.tablas,
      columnas: silos[0]?.columnas,
      indices: silos[0]?.indices,
    });
    const diferentes = silos.filter((silo) => JSON.stringify({
      tablas: silo.tablas,
      columnas: silo.columnas,
      indices: silo.indices,
    }) !== esquemaEsperado);
    if (diferentes.length > 0) {
      throw new Error(`Las bases difieren en tablas, columnas o índices: ${diferentes.map((silo) => silo.tenantId).join(", ")}`);
    }

    const migracionesDiferentes = silos.filter((silo) =>
      !coincideHistorialMigraciones(silo.migraciones, migracionesEsperadas),
    );
    if (migracionesDiferentes.length > 0) {
      throw new Error(
        `Los tenants no tienen exactamente los nombres/checksums de migración del repositorio: ${migracionesDiferentes.map((silo) => silo.tenantId).join(", ")}`,
      );
    }

    console.log(`Aislamiento por silo verificado: ${silos.length} bases distintas con ${migracionesEsperadas.length} migraciones, ${silos[0]?.tablas.length} tablas, ${silos[0]?.columnas.length} columnas e índices idénticos`);
  } finally {
    await Promise.all(tenantIds.map(invalidarClientesPrismaTenant));
  }
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
