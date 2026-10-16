"use server";

import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function obtenerPaginaPersonalizadaPorSlug(slug: string) {
  const { id: tenantId } = await requiereTenantActivo();
  return conPrismaTenant(tenantId, (prisma) => prisma.customPage.findFirst({
    where: { slug, tenantId, isActive: true },
    include: {
      sections: {
        where: { tenantId },
        include: { items: { where: { tenantId } } },
        orderBy: { order: "asc" },
      },
    },
  }));
}
