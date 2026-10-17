"use server";

import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { conPrisma } from "@/lib/prisma";

export async function obtenerPaginaPersonalizadaPorSlug(slug: string) {
  await requiereTenantActivo();
  return conPrisma((prisma) => prisma.customPage.findFirst({
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
