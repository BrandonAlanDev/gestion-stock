"use server";

import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function obtenerPaginaPersonalizadaPorSlug(slug: string) {
  const { id: tenantId } = await requiereTenantActivo();
  return conPrismaTenant(tenantId, (prisma) => prisma.customPage.findFirst({
    where: { slug, isActive: true },
    include: {
      sections: {
        where: {},
        include: { items: { where: {} } },
        orderBy: { order: "asc" },
      },
    },
  }));
}
