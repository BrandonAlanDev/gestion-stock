import "server-only";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import type { ContextoTenantSesion } from "@/types/tenants";

/** Compatibilidad temporal durante la migración de consumidores. */
export async function requerirAdministradorTenant(): Promise<ContextoTenantSesion> {
  return requiereAdmin();
}
