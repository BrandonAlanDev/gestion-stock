import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";
import type { CredencialesBaseTenant } from "../../src/lib/tenants/registry/types";
import {
  validarHistorialAntesDeDeploy,
  type MigracionVersionada,
} from "./comparar-migraciones";

interface FilaConteo {
  cantidad: bigint | number;
}

interface FilaMigracion {
  migration_name: string;
  checksum: string;
  finished_at: Date | null;
  rolled_back_at: Date | null;
}

export interface ResultadoPreflightMigracion {
  migracionesAplicadas: number;
  objetosPersistentes: number;
}

const MIGRACION_STOCK_NO_NEGATIVO = "20261106010000_stock_no_negativo";

function versionEsAlMenos(version: string, requerida: readonly number[]): boolean {
  const actual = version.match(/\d+\.\d+\.\d+/)?.[0]
    .split(".")
    .map(Number);
  if (!actual) return false;
  for (let indice = 0; indice < requerida.length; indice += 1) {
    const diferencia = (actual[indice] ?? 0) - requerida[indice]!;
    if (diferencia !== 0) return diferencia > 0;
  }
  return true;
}

async function verificarPrecondicionesCheckStock(
  cliente: PrismaClient,
  base: string,
): Promise<void> {
  const [version] = await cliente.$queryRaw<Array<{ version: string }>>`
    SELECT VERSION() AS version
  `;
  if (!version?.version) throw new Error("No se pudo identificar el motor de base de datos.");

  const [tablaVariantes] = await cliente.$queryRaw<FilaConteo[]>`
    SELECT COUNT(*) AS cantidad
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'GarmentVariant'
  `;
  if (Number(tablaVariantes?.cantidad ?? 0) !== 1) {
    throw new Error(`No se encontró GarmentVariant en ${base}; se cancela el preflight de ${MIGRACION_STOCK_NO_NEGATIVO}.`);
  }
  const [stockNegativo] = await cliente.$queryRaw<FilaConteo[]>`
    SELECT COUNT(*) AS cantidad
    FROM GarmentVariant
    WHERE stock < 0
  `;
  const cantidadNegativa = Number(stockNegativo?.cantidad ?? 0);
  if (cantidadNegativa > 0) {
    throw new Error(
      `No se aplicó ${MIGRACION_STOCK_NO_NEGATIVO}: ${cantidadNegativa} variantes tienen stock negativo. No se modificaron esos datos; deben investigarse y corregirse con una operación autorizada antes de reintentar.`,
    );
  }

  const versionMotor = version.version;
  const versionTidb = versionMotor.match(/TiDB-v(\d+)\.(\d+)\.(\d+)/i);
  if (versionMotor.toLowerCase().includes("tidb")) {
    if (!versionTidb || !versionEsAlMenos(`${versionTidb[1]}.${versionTidb[2]}.${versionTidb[3]}`, [7, 2, 0])) {
      throw new Error(`${MIGRACION_STOCK_NO_NEGATIVO} requiere TiDB 7.2.0 o superior; destino: ${base}.`);
    }
    const [checkConstraint] = await cliente.$queryRaw<Array<{ habilitado: number | bigint | string }>>`
      SELECT @@GLOBAL.tidb_enable_check_constraint AS habilitado
    `;
    const habilitado = String(checkConstraint?.habilitado ?? "").toLowerCase();
    if (!(["1", "on", "true"].includes(habilitado))) {
      throw new Error(
        `No se aplicó ${MIGRACION_STOCK_NO_NEGATIVO}: TiDB debe tener tidb_enable_check_constraint=ON.`,
      );
    }
    return;
  }

  if (/mariadb/i.test(versionMotor)) {
    const versionMariaDB = versionMotor.match(/(\d+\.\d+\.\d+)-MariaDB/i)?.[1] ?? versionMotor;
    if (!versionEsAlMenos(versionMariaDB, [10, 2, 0])) {
      throw new Error(`${MIGRACION_STOCK_NO_NEGATIVO} requiere MariaDB 10.2.0 o superior; destino: ${base}.`);
    }
    const variables = await cliente.$queryRaw<Array<{ Variable_name: string; Value: string }>>`
      SHOW GLOBAL VARIABLES LIKE 'check_constraint_checks'
    `;
    if (variables[0]?.Value.toLowerCase() === "off") {
      throw new Error(`No se aplicó ${MIGRACION_STOCK_NO_NEGATIVO}: MariaDB debe tener check_constraint_checks=ON.`);
    }
    return;
  }

  if (/mysql/i.test(versionMotor) && versionEsAlMenos(versionMotor, [8, 0, 16])) return;
  throw new Error(
    `${MIGRACION_STOCK_NO_NEGATIVO} requiere TiDB 7.2+, MariaDB 10.2+ o MySQL 8.0.16+ con CHECK aplicado; motor en ${base}: ${versionMotor}`,
  );
}

/** Lee el historial del destino y siempre desconecta el cliente administrativo temporal. */
export async function inspeccionarHistorialMigracionTenant(
  credenciales: CredencialesBaseTenant,
  migracionesVersionadas: readonly MigracionVersionada[],
): Promise<ResultadoPreflightMigracion> {
  const adapter = new PrismaMariaDb({
    host: credenciales.host,
    port: credenciales.puerto,
    user: credenciales.usuario,
    password: credenciales.contrasena,
    database: credenciales.base,
    ssl: credenciales.ssl ? { rejectUnauthorized: true } : false,
    connectionLimit: 1,
    connectTimeout: 10_000,
  });
  const cliente = new PrismaClient({ adapter });

  try {
    await cliente.$connect();
  } catch (error) {
    try {
      await cliente.$disconnect();
    } catch {
      // Una conexión fallida no debe ocultar el error que impedirá migrar.
    }
    throw error;
  }

  try {
    const [baseActual] = await cliente.$queryRaw<Array<{ nombre: string | null }>>`
      SELECT DATABASE() AS nombre
    `;
    if (baseActual?.nombre !== credenciales.base) {
      throw new Error("La conexión administrativa no llegó a la base de datos confirmada");
    }

    const [tablas] = await cliente.$queryRaw<FilaConteo[]>`
      SELECT COUNT(*) AS cantidad
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME <> '_prisma_migrations'
    `;
    const [tablaHistorial] = await cliente.$queryRaw<FilaConteo[]>`
      SELECT COUNT(*) AS cantidad
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = '_prisma_migrations'
    `;
    const objetosPersistentes = Number(tablas?.cantidad ?? 0);
    let registros: FilaMigracion[] = [];

    if (Number(tablaHistorial?.cantidad ?? 0) > 0) {
      registros = await cliente.$queryRaw<FilaMigracion[]>`
        SELECT migration_name, checksum, finished_at, rolled_back_at
        FROM _prisma_migrations
        ORDER BY migration_name
      `;
    }

    const historial = registros.map((registro) => ({
      nombre: registro.migration_name,
      checksum: registro.checksum,
      finalizada: registro.finished_at !== null,
      revertida: registro.rolled_back_at !== null,
    }));
    validarHistorialAntesDeDeploy(
      historial,
      migracionesVersionadas,
      objetosPersistentes > 0,
    );

    const checkStockPendiente = migracionesVersionadas.some(
      (migracion) => migracion.nombre === MIGRACION_STOCK_NO_NEGATIVO,
    ) && !historial.some((migracion) =>
      migracion.nombre === MIGRACION_STOCK_NO_NEGATIVO &&
      migracion.finalizada &&
      !migracion.revertida,
    );
    if (checkStockPendiente) {
      await verificarPrecondicionesCheckStock(cliente, credenciales.base);
    }

    return {
      migracionesAplicadas: historial.filter((registro) => registro.finalizada && !registro.revertida).length,
      objetosPersistentes,
    };
  } finally {
    try {
      await cliente.$disconnect();
    } catch {
      // La desconexión no debe reemplazar el resultado del preflight.
    }
  }
}
