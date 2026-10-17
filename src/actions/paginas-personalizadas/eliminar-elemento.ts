"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";

export async function eliminarElementoSeccion(id: string) {
  await requiereAdmin();
  return conPrisma((prisma) =>
    prisma.customSectionItem.deleteMany({ where: { id } }),
  );
}
