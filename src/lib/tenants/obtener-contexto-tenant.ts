import "server-only";

import { obtenerTenantDeSesion } from "@/lib/tenants/obtener-tenant-de-sesion";
import { obtenerTenantPublico } from "@/lib/tenants/obtener-tenant-publico";
import type { ContextoTenant } from "@/types/tenants";

export async function obtenerContextoTenant(): Promise<ContextoTenant | null> {
  const tenant = await obtenerTenantPublico();
  if (!tenant || tenant.estado !== "ACTIVO") return null;

  const contextoSesion = await obtenerTenantDeSesion();
  if (contextoSesion) return contextoSesion;

  return {
    tenantId: tenant.id,
    tenantNombre: tenant.nombre,
    tenantSlug: tenant.slug,
    tenantDominio: tenant.dominio,
    tenantEstado: tenant.estado,
  };
}
