"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function obtenerPaginaPersonalizadaPorId(id: string) {
  const { tenantId } = await requiereAdmin();
  return conPrismaTenant(tenantId, (prisma) => prisma.customPage.findFirst({
    where: { id },
    include: {
      sections: {
        where: {},
        include: { items: { where: {} } },
        orderBy: { order: "asc" },
      },
    },
  }));
}
