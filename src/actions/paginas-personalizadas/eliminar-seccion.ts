"use server";

import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function eliminarSeccionPersonalizada(id: string) {
  const { tenantId } = await requiereAdmin();
  return prisma.customSection.deleteMany({ where: { id, tenantId } });
}
