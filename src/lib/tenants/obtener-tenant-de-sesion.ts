import "server-only";

import { cache } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { obtenerTenantPublico } from "@/lib/tenants/obtener-tenant-publico";
import type { ContextoTenantSesion } from "@/types/tenants";

const obtenerTenantDeSesionMemoizado = cache(
  async (): Promise<ContextoTenantSesion | null> => {
    const [tenant, sesion] = await Promise.all([
      obtenerTenantPublico(),
      auth(),
    ]);
    const usuarioSesion = sesion?.user;

    if (
      !tenant ||
      !usuarioSesion?.id ||
      !usuarioSesion.tenantId ||
      usuarioSesion.tenantId !== tenant.id
    ) {
      return null;
    }

    const usuarioBase = await prisma.user.findFirst({
      where: {
        id: usuarioSesion.id,
        tenantId: usuarioSesion.tenantId,
      },
      select: {
        id: true,
        tenantId: true,
        role: true,
      },
    });

    if (
      !usuarioBase ||
      usuarioBase.id !== usuarioSesion.id ||
      usuarioBase.tenantId !== usuarioSesion.tenantId ||
      usuarioBase.tenantId !== tenant.id
    ) {
      return null;
    }

    return {
      tenantId: tenant.id,
      tenantNombre: tenant.nombre,
      tenantSlug: tenant.slug,
      tenantDominio: tenant.dominio,
      tenantEstado: tenant.estado,
      usuarioId: usuarioBase.id,
      rol: usuarioBase.role,
    };
  },
);

export async function obtenerTenantDeSesion(): Promise<ContextoTenantSesion | null> {
  return obtenerTenantDeSesionMemoizado();
}
