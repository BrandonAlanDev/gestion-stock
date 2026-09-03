import "server-only";

import { obtenerTenantPublico } from "@/lib/tenants/obtener-tenant-publico";
import type { TenantPublico } from "@/types/tenants";

export async function requiereTenantActivo(): Promise<TenantPublico> {
  const tenant = await obtenerTenantPublico();
  if (!tenant) throw new Error("Sitio no configurado");
  if (tenant.estado === "SUSPENDIDO") throw new Error("Sitio suspendido");
  if (tenant.estado !== "ACTIVO") throw new Error("Sitio no disponible");
  return tenant;
}
