"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function eliminarPaginaPersonalizada(id: string) {
  const { tenantId } = await requiereAdmin();
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.customPage.deleteMany({ where: { id } }),
  );
}
