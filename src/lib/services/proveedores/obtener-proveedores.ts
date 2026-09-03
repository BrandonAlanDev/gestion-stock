import "server-only";

import { prisma } from "@/lib/prisma";

export async function obtenerProveedores(tenantId: string) {
  return prisma.provider.findMany({
    where: { tenantId, active: true },
    orderBy: { name: "asc" },
    include: {
      contacts: {
        where: { tenantId, active: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
