"use server";

import { prisma } from "@/lib/prisma";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";

export async function obtenerPaginaPersonalizadaPorSlug(slug: string) {
  const { id: tenantId } = await requiereTenantActivo();
  return prisma.customPage.findFirst({
    where: { slug, tenantId, isActive: true },
    include: {
      sections: {
        include: { items: true },
        orderBy: { order: "asc" },
      },
    },
  });
}
