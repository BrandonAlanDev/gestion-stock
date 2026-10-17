"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";

export async function obtenerPaginaPersonalizadaPorId(id: string) {
  await requiereAdmin();
  return conPrisma((prisma) => prisma.customPage.findFirst({
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
