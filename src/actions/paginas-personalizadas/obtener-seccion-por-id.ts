"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";

export async function obtenerSeccionPersonalizadaPorId(id: string) {
  await requiereAdmin();
  return conPrisma((prisma) => prisma.customSection.findFirst({
    where: { id },
    include: { items: { where: {} } },
  }));
}
