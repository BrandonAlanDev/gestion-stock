import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";
import type { CredencialesBaseTenant } from "../../src/lib/tenants/registry/types";
import {
  validarHistorialAntesDeDeploy,
  type EstadoTenantMigrable,
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

/** Lee el historial del destino y siempre desconecta el cliente administrativo temporal. */
export async function inspeccionarHistorialMigracionTenant(
  credenciales: CredencialesBaseTenant,
  migracionesVersionadas: readonly MigracionVersionada[],
  estadoTenant: EstadoTenantMigrable,
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
      estadoTenant,
    );

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
