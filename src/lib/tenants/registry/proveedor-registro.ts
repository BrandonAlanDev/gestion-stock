import "server-only";

import { ProveedorRegistroCacheado } from "./proveedor-cacheado";
import { ProveedorBaseCore } from "./proveedor-base-core";
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
  const urlConexion = process.env.LOGABYTE_CORE_DATABASE_URL;
  const secreto = process.env.CIFRADO_CONEXIONES_SECRETO;
  if (!urlConexion || !secreto) {
    throw new Error("Falta configurar la conexión directa a la base de Logabyte Core");
  }
  return new ProveedorBaseCore(
    urlConexion,
    "gestion-stock",
    secreto,
  );
}

/** Permite inyectar un proveedor en pruebas y tareas administrativas. */
export function configurarProveedorRegistroTenant(
  proveedor: TenantRegistryProvider,
): ProveedorRegistroCacheado {
  const cacheado = new ProveedorRegistroCacheado(proveedor);
  globalRegistro.__proveedorRegistroTenant = cacheado;
  return cacheado;
}
