import "server-only";

import { obtenerTenantPublico } from "@/lib/tenants/obtener-tenant-publico";
import type { TenantPublico } from "@/types/tenants";

/** Compatibilidad temporal durante la migración de consumidores. */
export async function obtenerTenantActual(): Promise<TenantPublico | null> {
  return obtenerTenantPublico();
}
