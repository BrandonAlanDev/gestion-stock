import "server-only";

import type { TenantPublico } from "@/types/tenants";

/** Identificador transitorio para las firmas que aún reciben tenantId. */
export const ID_TIENDA = "tienda";

export async function obtenerTenantPublico(): Promise<TenantPublico> {
  return {
    id: ID_TIENDA,
    nombre: "Tienda",
    slug: "tienda",
    dominio: null,
    estado: "ACTIVO",
  };
}
