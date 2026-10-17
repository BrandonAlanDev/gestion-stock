"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function obtenerElementoSeccionPorId(id: string) {
  const { tenantId } = await requiereAdmin();
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.customSectionItem.findFirst({ where: { id } }),
  );
}
