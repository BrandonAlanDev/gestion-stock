"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";

export async function obtenerPaginasPersonalizadas() {
  await requiereAdmin();
  return conPrisma((prisma) => prisma.customPage.findMany({
    where: {},
    include: {
      sections: {
        where: {},
        include: { items: { where: {} } },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  }));
}
