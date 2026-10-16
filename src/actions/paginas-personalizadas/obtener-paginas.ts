"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function obtenerPaginasPersonalizadas() {
  const { tenantId } = await requiereAdmin();
  return conPrismaTenant(tenantId, (prisma) => prisma.customPage.findMany({
    where: { tenantId },
    include: {
      sections: {
        where: { tenantId },
        include: { items: { where: { tenantId } } },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  }));
}
