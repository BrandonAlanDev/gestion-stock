import "server-only";

import { cache } from "react";
import { auth } from "@/auth";
import { conPrismaTenant } from "@/lib/prisma";
import { obtenerTenantPublico } from "@/lib/tenants/obtener-tenant-publico";
import { resolverContextoSesionTenant } from "@/lib/tenants/resolver-contexto-sesion";
import type { ContextoTenantSesion } from "@/types/tenants";

const obtenerTenantDeSesionMemoizado = cache(
  async (): Promise<ContextoTenantSesion | null> => {
    const [tenant, sesion] = await Promise.all([
      obtenerTenantPublico(),
      auth(),
    ]);
    return resolverContextoSesionTenant(
      tenant,
      {
        id: sesion?.user?.id,
        tenantId: sesion?.user?.tenantId,
      },
      (tenantId, usuarioId) => conPrismaTenant(tenantId, (prisma) =>
        prisma.user.findFirst({
          where: { id: usuarioId },
          select: { id: true, role: true },
        }),
      ),
    );
  },
);

export async function obtenerTenantDeSesion(): Promise<ContextoTenantSesion | null> {
  return obtenerTenantDeSesionMemoizado();
}
