"use server";

import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function obtenerPaginasPersonalizadas() {
  const { tenantId } = await requiereAdmin();
  return prisma.customPage.findMany({
    where: { tenantId },
    include: {
      sections: {
        include: { items: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
