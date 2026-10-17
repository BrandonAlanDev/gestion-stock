import "server-only";

import { conPrisma } from "@/lib/prisma";

export async function obtenerProveedores(tenantId: string) {
  void tenantId;
  return conPrisma((prisma) => prisma.provider.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      contacts: {
        where: { active: true },
        orderBy: { createdAt: "asc" },
      },
    },
  }));
}
