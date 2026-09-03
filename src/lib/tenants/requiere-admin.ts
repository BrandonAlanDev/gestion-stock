import "server-only";

import { obtenerTenantDeSesion } from "@/lib/tenants/obtener-tenant-de-sesion";
import type { ContextoTenantSesion } from "@/types/tenants";

export async function requiereAdmin(): Promise<ContextoTenantSesion> {
  const contexto = await obtenerTenantDeSesion();
  if (!contexto) throw new Error("No autorizado");
  if (contexto.tenantEstado === "SUSPENDIDO") {
    throw new Error("Sitio suspendido");
  }
  if (contexto.tenantEstado !== "ACTIVO") {
    throw new Error("Sitio no disponible");
  }
  if (contexto.rol !== "ADMIN") throw new Error("No autorizado");
  return contexto;
}
