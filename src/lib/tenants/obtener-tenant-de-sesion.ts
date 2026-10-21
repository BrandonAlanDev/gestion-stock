import "server-only";

import { cache } from "react";
import { obtenerSesionSolicitud } from "@/lib/autenticacion/obtener-sesion-solicitud";
import { obtenerTenantPublico } from "@/lib/tenants/obtener-tenant-publico";
import type { ContextoTenantSesion } from "@/types/tenants";

const obtenerTenantDeSesionMemoizado = cache(
  async (): Promise<ContextoTenantSesion | null> => {
    const [tenant, sesion] = await Promise.all([
      obtenerTenantPublico(),
      obtenerSesionSolicitud(),
    ]);
    const usuario = sesion?.user;
    if (!tenant || tenant.estado !== "ACTIVO" || !usuario?.id ||
        usuario.tenantId !== tenant.id ||
        (usuario.role !== "ADMIN" && usuario.role !== "USER")) return null;

    return {
      tenantId: tenant.id,
      tenantNombre: tenant.nombre,
      tenantSlug: tenant.slug,
      tenantDominio: tenant.dominio,
      tenantEstado: tenant.estado,
      usuarioId: usuario.id,
      rol: usuario.role,
    };
  },
);

export async function obtenerTenantDeSesion(): Promise<ContextoTenantSesion | null> {
  return obtenerTenantDeSesionMemoizado();
}
