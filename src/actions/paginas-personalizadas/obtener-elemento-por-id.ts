"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";

export async function obtenerElementoSeccionPorId(id: string) {
  await requiereAdmin();
  return conPrisma((prisma) =>
    prisma.customSectionItem.findFirst({ where: { id } }),
  );
}
