import "server-only";

import { obtenerTenantPublico } from "@/lib/tenants/obtener-tenant-publico";
import type { TenantPublico } from "@/types/tenants";

export async function obtenerTenantAutenticacion(): Promise<TenantPublico> {
  const tenant = await obtenerTenantPublico();

  if (!tenant || tenant.estado !== "ACTIVO") {
    throw new Error("La organización no está disponible");
  }

  return tenant;
}
