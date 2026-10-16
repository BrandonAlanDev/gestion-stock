import "server-only";

import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function obtenerProveedores(tenantId: string) {
  return conPrismaTenant(tenantId, (prisma) => prisma.provider.findMany({
    where: { tenantId, active: true },
    orderBy: { name: "asc" },
    include: {
      contacts: {
        where: { tenantId, active: true },
        orderBy: { createdAt: "asc" },
      },
    },
  }));
}
