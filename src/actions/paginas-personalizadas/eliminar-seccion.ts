"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";

export async function eliminarSeccionPersonalizada(id: string) {
  await requiereAdmin();
  return conPrisma((prisma) =>
    prisma.customSection.deleteMany({ where: { id } }),
  );
}
