"use server";

import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function eliminarPaginaPersonalizada(id: string) {
  const { tenantId } = await requiereAdmin();
  return prisma.customPage.deleteMany({ where: { id, tenantId } });
}
