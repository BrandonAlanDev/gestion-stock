"use server";

import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function obtenerSeccionPersonalizadaPorId(id: string) {
  const { tenantId } = await requiereAdmin();
  return prisma.customSection.findFirst({
    where: { id, tenantId },
    include: { items: true },
  });
}
