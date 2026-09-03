import "server-only";

import { prisma } from "@/lib/prisma";

export async function eliminarProveedor(tenantId: string, id: string) {
  return prisma.$transaction(async (tx) => {
    const proveedor = await tx.provider.findFirst({
      where: { id, tenantId, active: true },
      select: { id: true },
    });
    if (!proveedor) throw new Error("Proveedor no encontrado");

    await tx.contactProvider.updateMany({
      where: { tenantId, idProvider: proveedor.id },
      data: { active: false },
    });

    await tx.provider.updateMany({
      where: { id: proveedor.id, tenantId },
      data: { active: false },
    });

    return { id: proveedor.id };
  });
}
