import "server-only";

import { ProveedorRegistroCacheado } from "./proveedor-cacheado";
import { ClienteLogabyteCore } from "./cliente-logabyte-core";
import { ProveedorLogabyteCore } from "./proveedor-logabyte-core";
import type { TenantRegistryProvider } from "./types";

const globalRegistro = globalThis as typeof globalThis & {
  __proveedorRegistroTenant?: ProveedorRegistroCacheado;
};

export function obtenerProveedorRegistroTenant(): ProveedorRegistroCacheado {
  if (!globalRegistro.__proveedorRegistroTenant) {
    const proveedor = crearProveedorConfigurado();
    globalRegistro.__proveedorRegistroTenant = new ProveedorRegistroCacheado(
      proveedor,
    );
  }
  return globalRegistro.__proveedorRegistroTenant;
}

function crearProveedorConfigurado(): TenantRegistryProvider {
  const urlBase = process.env.LOGABYTE_CORE_URL;
  const token = process.env.LOGABYTE_CORE_SERVICE_TOKEN;
  const producto = process.env.LOGABYTE_CORE_PRODUCTO ?? "gestion-stock";
  const timeoutLocal = process.env.NODE_ENV === "development"
    ? process.env.LOGABYTE_CORE_TIMEOUT_MS
    : undefined;
  if (!urlBase || !token) {
    throw new Error("Falta configurar Logabyte Core");
  }
  if (timeoutLocal && !/^\d+$/.test(timeoutLocal)) {
    throw new Error("LOGABYTE_CORE_TIMEOUT_MS debe ser un entero en milisegundos");
  }
  const cliente = new ClienteLogabyteCore({
    urlBase,
    token,
    producto,
    timeoutMs: timeoutLocal ? Number(timeoutLocal) : undefined,
  });
  return new ProveedorLogabyteCore(cliente, cliente);
}

/** Permite inyectar un proveedor en pruebas y tareas administrativas. */
export function configurarProveedorRegistroTenant(
  proveedor: TenantRegistryProvider,
): ProveedorRegistroCacheado {
  const cacheado = new ProveedorRegistroCacheado(proveedor);
  globalRegistro.__proveedorRegistroTenant = cacheado;
  return cacheado;
}
