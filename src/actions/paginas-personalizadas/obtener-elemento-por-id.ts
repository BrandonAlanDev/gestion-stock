"use server";

import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function obtenerElementoSeccionPorId(id: string) {
  const { tenantId } = await requiereAdmin();
  return prisma.customSectionItem.findFirst({ where: { id, tenantId } });
}
