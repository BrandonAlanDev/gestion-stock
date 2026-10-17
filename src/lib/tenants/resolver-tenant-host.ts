import "server-only";

import { obtenerTenantPublico } from "@/lib/tenants/obtener-tenant-publico";

/** Compatibilidad con los handlers existentes mientras se retira el parámetro tenant. */
export async function resolverTenantPorHost(_host: string) {
  void _host;
  return obtenerTenantPublico();
}
