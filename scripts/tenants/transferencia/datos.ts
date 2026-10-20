import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { Prisma, PrismaClient } from "../../../generated/prisma/client";
import { MANIFIESTO_TABLAS_TENANT } from "../../../src/lib/tenants/migracion-datos/manifiesto";
import type { ColumnaAuditoriaOrigen } from "../auditar-relaciones-origen";
import { construirUrlMysql } from "../crear-url-mysql";
import type { CredencialesBaseTenant } from "../../../src/lib/tenants/registry/types";

export interface ConfiguracionOrigen {
  host: string;
  puerto: number;
  usuario: string;
  contrasena: string;
  base: string;
  ssl: boolean;
  tenantId: string;
}

export interface TablaFisica {
  tabla: string;
  columnas: ColumnaAuditoriaOrigen[];
}

export interface MigracionAplicada {
  migration_name: string;
  checksum: string;
  finished_at: Date | null;
  rolled_back_at: Date | null;
}

export interface DelegadoTransferencia {
  findMany(argumentos: {
    where: Record<string, unknown>;
    orderBy: Record<string, "asc">;
    take: number;
    skip: number;
  }): Promise<Array<Record<string, unknown>>>;
  count(argumentos: { where: Record<string, unknown> }): Promise<number>;
  createMany(argumentos: {
    data: Array<Record<string, unknown>>;
  }): Promise<{ count: number }>;
  update(argumentos: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }): Promise<Record<string, unknown>>;
}

export type ClienteTransferencia = PrismaClient | Prisma.TransactionClient;

export const CLAVES_PRIMARIAS: Readonly<Record<string, readonly string[]>> = {
  GarmentVariantOptionValue: ["variantId", "optionValueId"],
};

export const CAMPOS_JSON: Readonly<Record<string, readonly string[]>> = {
  Garment: ["etiquetas"],
  GarmentVariant: ["attributes"],
  Carousel: ["settings"],
  CarouselSlide: ["config"],
  CustomSection: ["config"],
  CustomSectionItem: ["config"],
  MetodoPago: ["config"],
  Payment: ["metadata"],
};

export function crearCliente(credenciales: CredencialesBaseTenant): PrismaClient {
  const adapter = new PrismaMariaDb({
    host: credenciales.host,
    port: credenciales.puerto,
    user: credenciales.usuario,
    password: credenciales.contrasena,
    database: credenciales.base,
    ssl: credenciales.ssl ? { rejectUnauthorized: true } : false,
    connectionLimit: 2,
    connectTimeout: 10_000,
  });
  return new PrismaClient({ adapter });
}

export function identificadorSql(valor: string): Prisma.Sql {
  if (!/^[a-zA-Z0-9_$]+$/.test(valor)) {
    throw new Error("El manifiesto contiene un identificador SQL inválido");
  }
  return Prisma.raw(`\`${valor}\``);
}

export function delegado(cliente: ClienteTransferencia, modelo: string): DelegadoTransferencia {
  const propiedad = `${modelo[0]?.toLowerCase() ?? ""}${modelo.slice(1)}`;
  const valor = (cliente as unknown as Record<string, unknown>)[propiedad];
  if (typeof valor !== "object" || valor === null) {
    throw new Error(`No existe un delegado Prisma para ${modelo}`);
  }
  return valor as DelegadoTransferencia;
}

export function construirWhere(modelo: string, tenantId: string): Record<string, unknown> {
  const tabla = MANIFIESTO_TABLAS_TENANT.find((entrada) => entrada.modelo === modelo);
  if (!tabla) throw new Error(`El modelo ${modelo} no tiene regla de selección`);

  switch (tabla.seleccion.tipo) {
    case "registro-tenant":
      return { id: tenantId };
    case "columna-tenant":
      return { tenantId };
    case "puente-tenant":
      return {
        variant: { is: { tenantId } },
        optionValue: { is: { tenantId } },
      };
  }
}

export function clavesPrimarias(modelo: string): readonly string[] {
  return CLAVES_PRIMARIAS[modelo] ?? ["id"];
}

export function ordenPrimario(modelo: string): Record<string, "asc"> {
  return Object.fromEntries(clavesPrimarias(modelo).map((campo) => [campo, "asc"]));
}

export function claveFila(fila: Record<string, unknown>, campos: readonly string[]): string {
  return JSON.stringify(campos.map((campo) => normalizarParaHash(fila[campo])));
}

export function normalizarParaHash(valor: unknown): unknown {
  if (valor === Prisma.JsonNull) return { tipo: "Prisma.JsonNull" };
  if (valor === Prisma.DbNull) return { tipo: "Prisma.DbNull" };
  if (valor === Prisma.AnyNull) return { tipo: "Prisma.AnyNull" };
  if (typeof valor === "bigint") return { tipo: "bigint", valor: valor.toString() };
  if (valor instanceof Date) return { tipo: "Date", valor: valor.toISOString() };
  if (valor instanceof Prisma.Decimal) return { tipo: "Decimal", valor: valor.toString() };
  if (valor instanceof Uint8Array) {
    return { tipo: "bytes", valor: Buffer.from(valor).toString("hex") };
  }
  if (Array.isArray(valor)) return valor.map(normalizarParaHash);
  if (typeof valor === "object" && valor !== null) {
    return Object.fromEntries(
      Object.keys(valor)
        .sort()
        .map((clave) => [clave, normalizarParaHash((valor as Record<string, unknown>)[clave])]),
    );
  }
  return valor;
}

export function serializarFila(fila: Record<string, unknown>): string {
  return JSON.stringify(normalizarParaHash(fila));
}

export async function agregarSemanticaJson(
  cliente: ClienteTransferencia,
  modelo: string,
  tabla: string,
  filas: Array<Record<string, unknown>>,
): Promise<Array<Record<string, unknown>>> {
  const camposJson = CAMPOS_JSON[modelo] ?? [];
  if (camposJson.length === 0 || filas.length === 0) return filas;

  const claves = clavesPrimarias(modelo);
  const condiciones = filas.map((fila) => Prisma.sql`(
    ${Prisma.join(claves.map((campo) => Prisma.sql`${identificadorSql(campo)} = ${fila[campo]}`), " AND ")}
  )`);
  const proyeccion = [
    ...claves.map((campo, indice) => Prisma.sql`${identificadorSql(campo)} AS ${identificadorSql(`__clave_${indice}`)}`),
    ...camposJson.map((campo) => Prisma.sql`JSON_TYPE(${identificadorSql(campo)}) AS ${identificadorSql(`__json_${campo}`)}`),
  ];
  const metadatos = await cliente.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
    SELECT ${Prisma.join(proyeccion, ", ")}
    FROM ${identificadorSql(tabla)}
    WHERE ${Prisma.join(condiciones, " OR ")}
  `);

  const tiposPorClave = new Map<string, Record<string, unknown>>();
  for (const metadato of metadatos) {
    const valoresClave = claves.map((_campo, indice) => metadato[`__clave_${indice}`]);
    const clave = JSON.stringify(valoresClave.map(normalizarParaHash));
    tiposPorClave.set(clave, metadato);
  }

  return filas.map((fila) => {
    const clave = claveFila(fila, claves);
    const metadato = tiposPorClave.get(clave);
    if (!metadato) throw new Error(`Faltan metadatos JSON de ${modelo} durante la transferencia`);
    const copia = { ...fila };
    for (const campo of camposJson) {
      const tipo = metadato[`__json_${campo}`];
      if (tipo === null) copia[campo] = Prisma.DbNull;
      else if (tipo === "NULL") copia[campo] = Prisma.JsonNull;
      else if (typeof tipo !== "string") {
        throw new Error(`No se pudo interpretar el campo JSON ${modelo}.${campo}`);
      }
    }
    return copia;
  });
}

export async function leerInventario(cliente: ClienteTransferencia): Promise<{
  tablas: TablaFisica[];
  columnasPorTabla: Map<string, ColumnaAuditoriaOrigen[]>;
  indices: Array<Record<string, unknown>>;
}> {
  const columnas = await cliente.$queryRaw<ColumnaAuditoriaOrigen[]>`
    SELECT TABLE_NAME AS tabla, COLUMN_NAME AS columna, COLUMN_TYPE AS tipo,
      IS_NULLABLE AS nullable, CAST(COLUMN_DEFAULT AS CHAR) AS predeterminado,
      COLUMN_KEY AS clave, EXTRA AS extra
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
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
    SELECT TABLE_NAME AS tabla, INDEX_NAME AS indice, NON_UNIQUE AS unico,
      SEQ_IN_INDEX AS posicion, COLUMN_NAME AS columna, SUB_PART AS prefijo,
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
  return {
    tablas: [...columnasPorTabla].map(([tabla, campos]) => ({ tabla, columnas: campos })),
    columnasPorTabla,
    indices: indices as Array<Record<string, unknown>>,
  };
}

export async function validarMotoresTransaccionales(
  cliente: ClienteTransferencia,
  etiqueta: string,
): Promise<void> {
  const tablas = await cliente.$queryRaw<Array<{ tabla: string; motor: string | null }>>`
    SELECT TABLE_NAME AS tabla, ENGINE AS motor
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN (${Prisma.join(MANIFIESTO_TABLAS_TENANT.map((tabla) => Prisma.sql`${tabla.tabla}`))})
  `;
  const porTabla = new Map(tablas.map((tabla) => [tabla.tabla, tabla.motor?.toUpperCase()]));
  const incompatibles = MANIFIESTO_TABLAS_TENANT
    .filter((tabla) => porTabla.get(tabla.tabla) !== "INNODB")
    .map((tabla) => `${tabla.tabla}=${porTabla.get(tabla.tabla) ?? "ausente"}`);
  if (incompatibles.length > 0) {
    throw new Error(`${etiqueta}: la transferencia requiere tablas InnoDB (${incompatibles.join(", ")})`);
  }
}

export async function leerHistorial(cliente: ClienteTransferencia): Promise<{
  aplicadas: Array<{ nombre: string; checksum: string }>;
  hayIncompletas: boolean;
}> {
  const tablas = await cliente.$queryRaw<Array<{ tabla: string }>>`
    SELECT TABLE_NAME AS tabla FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '_prisma_migrations'
  `;
  if (tablas.length !== 1) throw new Error("La base no tiene _prisma_migrations");

  const filas = await cliente.$queryRaw<MigracionAplicada[]>`
    SELECT migration_name, checksum, finished_at, rolled_back_at
    FROM _prisma_migrations ORDER BY migration_name
  `;
  return {
    aplicadas: filas
      .filter((fila) => fila.finished_at !== null && fila.rolled_back_at === null)
      .map((fila) => ({ nombre: fila.migration_name, checksum: fila.checksum })),
    hayIncompletas: filas.some((fila) => fila.finished_at === null && fila.rolled_back_at === null),
  };
}

export async function obtenerMigracionesVersionadas(): Promise<Array<{ nombre: string; checksum: string }>> {
  const directorio = path.join(process.cwd(), "prisma", "migrations-base-unica");
  const entradas = await readdir(directorio, { withFileTypes: true });
  const nombres = entradas.filter((entrada) => entrada.isDirectory()).map((entrada) => entrada.name).sort();
  return Promise.all(nombres.map(async (nombre) => ({
    nombre,
    checksum: createHash("sha256")
      .update(await readFile(path.join(directorio, nombre, "migration.sql")))
      .digest("hex"),
  })));
}

export function validarEsquemaConPrisma(credenciales: CredencialesBaseTenant, etiqueta: string): void {
  const requireDesdeProyecto = createRequire(path.join(process.cwd(), "package.json"));
  const rutaPaquetePrisma = requireDesdeProyecto.resolve("prisma/package.json");
  const prismaCli = path.join(path.dirname(rutaPaquetePrisma), "build", "index.js");
  const env = { ...process.env, LOGABYTE_CORE_SELECTED_DATABASE_URL: construirUrlMysql(credenciales) };

  try {
    execFileSync(process.execPath, [
      prismaCli,
      "migrate",
      "diff",
      "--from-config-datasource",
      "--to-schema",
      "prisma/schema.prisma",
      "--exit-code",
    ], { cwd: process.cwd(), env, stdio: "ignore", windowsHide: true });
  } catch (error) {
    const codigo = typeof error === "object" && error !== null && "status" in error
      ? error.status
      : undefined;
    if (codigo === 2) throw new Error(`El esquema de ${etiqueta} difiere de prisma/schema.prisma`);
    throw new Error(`No se pudo comprobar el esquema de ${etiqueta}`);
  }
}

export async function obtenerIdentidad(cliente: ClienteTransferencia): Promise<{
  servidor: string;
  puerto: number;
  base: string;
}> {
  const [identidad] = await cliente.$queryRaw<Array<{
    servidor: string;
    puerto: number;
    base: string | null;
  }>>`SELECT @@hostname AS servidor, @@port AS puerto, DATABASE() AS base`;
  if (!identidad?.base) throw new Error("No se pudo identificar una de las bases MySQL");
  return { servidor: identidad.servidor, puerto: Number(identidad.puerto), base: identidad.base };
}
