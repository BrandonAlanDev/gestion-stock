"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";

export async function eliminarPaginaPersonalizada(id: string) {
  await requiereAdmin();
  return conPrisma((prisma) =>
    prisma.customPage.deleteMany({ where: { id } }),
  );
}
