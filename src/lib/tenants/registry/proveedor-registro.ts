import "server-only";

import { ProveedorRegistroCacheado } from "./proveedor-cacheado";
import { ClienteLogabyteCore } from "./cliente-logabyte-core";
import { ProveedorLogabyteCore } from "./proveedor-logabyte-core";
import { ProveedorRegistroLocal } from "./proveedor-local";
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
  if (process.env.NODE_ENV === "production") {
    const urlBase = process.env.LOGABYTE_CORE_URL;
    const token = process.env.LOGABYTE_CORE_SERVICE_TOKEN;
    const producto = process.env.LOGABYTE_CORE_PRODUCTO;
    if (!urlBase || !token || !producto) {
      throw new Error("Falta configurar Logabyte Core para producción");
    }
    const cliente = new ClienteLogabyteCore({ urlBase, token, producto });
    return new ProveedorLogabyteCore(cliente, cliente);
  }
  return new ProveedorRegistroLocal();
}

/** Permite inyectar un proveedor en pruebas y tareas administrativas. */
export function configurarProveedorRegistroTenant(
  proveedor: TenantRegistryProvider,
): ProveedorRegistroCacheado {
  if (process.env.NODE_ENV === "production" && proveedor instanceof ProveedorRegistroLocal) {
    throw new Error("El registro local no se permite en producción");
  }
  const cacheado = new ProveedorRegistroCacheado(proveedor);
  globalRegistro.__proveedorRegistroTenant = cacheado;
  return cacheado;
}
