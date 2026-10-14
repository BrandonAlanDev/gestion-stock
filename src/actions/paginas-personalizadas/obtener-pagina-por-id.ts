"use server";

import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function obtenerPaginaPersonalizadaPorId(id: string) {
  const { tenantId } = await requiereAdmin();
  return prisma.customPage.findFirst({
    where: { id, tenantId },
    include: {
      sections: {
        include: { items: true },
        orderBy: { order: "asc" },
      },
    },
  });
}
