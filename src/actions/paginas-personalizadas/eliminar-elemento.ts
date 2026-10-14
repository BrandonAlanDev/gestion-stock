"use server";

import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function eliminarElementoSeccion(id: string) {
  const { tenantId } = await requiereAdmin();
  return prisma.customSectionItem.deleteMany({ where: { id, tenantId } });
}
