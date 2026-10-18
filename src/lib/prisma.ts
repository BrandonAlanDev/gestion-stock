import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";
import { obtenerTenantIdRuntime } from "./tenants/contexto-tenant-runtime";
import { conContextoTenantRuntime } from "./tenants/contexto-tenant-runtime";
import { ErrorConexionTenant, GestorClientesTenant } from "./tenants/gestor-clientes-tenant";
import { crearOpcionesPoolTenant } from "./tenants/opciones-pool-tenant";
import { obtenerProveedorRegistroTenant } from "./tenants/registry/proveedor-registro";
import type { TenantRegistryEntry } from "./tenants/registry/types";

interface EstadoFactory {
  gestor: GestorClientesTenant<PrismaClient>;
}

const globalFactory = globalThis as typeof globalThis & {
  __factoryPrismaTenant?: EstadoFactory;
};

const codigosConexion = new Set([
  "P1000", "P1001", "P1002", "P1003", "P1008", "P1011", "P1017", "P2024", "P2037",
  "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "PROTOCOL_CONNECTION_LOST",
  "ER_ACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR",
]);

function esFalloConexion(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  return typeof error.code === "string" && codigosConexion.has(error.code);
}

function leerEnteroPositivo(valor: string | undefined, predeterminado: number, maximo: number): number {
  if (!valor || !/^\d+$/.test(valor)) return predeterminado;
  const numero = Number(valor);
  return numero > 0 && numero <= maximo ? numero : predeterminado;
}

async function crearClienteTenant(
  entry: TenantRegistryEntry,
  ttlInactividadMs: number,
  limiteConexiones: number,
): Promise<PrismaClient> {
  const credenciales = await obtenerProveedorRegistroTenant().resolverCredenciales(
    entry.referenciaBase,
    entry.versionCredenciales,
    entry.tenant.id,
  );
  if (process.env.NODE_ENV === "production" && !credenciales.ssl) {
    throw new Error("Las conexiones MySQL de producción deben usar TLS");
  }

  const adaptador = new PrismaMariaDb({
    host: credenciales.host,
    port: credenciales.puerto,
    user: credenciales.usuario,
    password: credenciales.contrasena,
    database: credenciales.base,
    ssl: credenciales.ssl ? { rejectUnauthorized: true } : false,
    ...crearOpcionesPoolTenant(ttlInactividadMs, limiteConexiones),
    connectTimeout: 10_000,
  });
  const cliente = new PrismaClient({ adapter: adaptador });
  try {
    await cliente.$connect();
    return cliente;
  } catch (error) {
    try {
      await cliente.$disconnect();
    } catch {
      // La conexión fallida no debe quedar abierta en el pool.
    }
    throw error;
  }
}

function obtenerGestor(): GestorClientesTenant<PrismaClient> {
  if (!globalFactory.__factoryPrismaTenant) {
    const ttlInactividadMs = leerEnteroPositivo(
      process.env.TENANT_PRISMA_IDLE_TTL_MS,
      60_000,
      3_600_000,
    );
    const limiteConexiones = leerEnteroPositivo(
      process.env.TENANT_PRISMA_CONNECTION_LIMIT,
      2,
      10,
    );
    globalFactory.__factoryPrismaTenant = {
      gestor: new GestorClientesTenant<PrismaClient>({
        limiteClientes: leerEnteroPositivo(process.env.TENANT_PRISMA_MAX_CLIENTS, 10, 100),
        ttlInactividadMs,
        crearCliente: (entry) => crearClienteTenant(
          entry,
          ttlInactividadMs,
          limiteConexiones,
        ),
        desconectarCliente: (cliente) => cliente.$disconnect(),
      }),
    };
  }
  return globalFactory.__factoryPrismaTenant.gestor;
}

export async function invalidarClientesPrismaTenant(tenantId: string): Promise<void> {
  await obtenerGestor().invalidar(tenantId);
}

/** Ejecuta una operación en el silo activo y mantiene el lease durante toda la operación. */
export async function conPrismaTenant<T>(
  tenantId: string,
  operacion: (cliente: PrismaClient) => Promise<T>,
): Promise<T> {
  const registro = obtenerProveedorRegistroTenant();
  const entry = await registro.resolverPorId(tenantId);
  if (!entry || entry.tenant.estado !== "ACTIVO") {
    await invalidarClientesPrismaTenant(tenantId);
    throw new Error("La organización no está disponible");
  }

  try {
    const versionVigente = await registro.verificarAcceso(entry.tenant.id);
    if (versionVigente !== undefined && versionVigente !== entry.versionCache) {
      registro.invalidar();
      throw new Error("El registro del tenant cambió; reintentá la operación");
    }
  } catch (error) {
    await invalidarClientesPrismaTenant(tenantId);
    throw error;
  }

  try {
    return await obtenerGestor().ejecutar(entry, (cliente) =>
      conContextoTenantRuntime(tenantId, () => operacion(cliente)),
    );
  } catch (error) {
    if (error instanceof ErrorConexionTenant || esFalloConexion(error)) {
      registro.invalidar();
      await invalidarClientesPrismaTenant(tenantId);
    }
    throw error;
  }
}

/** Selecciona el silo del hostname recibido en la petición actual. */
export async function conPrisma<T>(
  operacion: (cliente: PrismaClient) => Promise<T>,
): Promise<T> {
  const tenantIdRuntime = obtenerTenantIdRuntime();
  if (tenantIdRuntime) return conPrismaTenant(tenantIdRuntime, operacion);
  const { obtenerTenantPublico } = await import("./tenants/obtener-tenant-publico");
  const tenant = await obtenerTenantPublico();
  if (!tenant || tenant.estado !== "ACTIVO") {
    throw new Error("La organización no está disponible");
  }
  return conPrismaTenant(tenant.id, operacion);
}
