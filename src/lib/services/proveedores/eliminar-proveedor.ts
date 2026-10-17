import "server-only";

import { conPrisma } from "@/lib/prisma";

export async function eliminarProveedor(tenantId: string, id: string) {
  return conPrisma((prisma) => prisma.$transaction(async (tx) => {
    const proveedor = await tx.provider.findFirst({
      where: { id, active: true },
      select: { id: true },
    });
    if (!proveedor) throw new Error("Proveedor no encontrado");

    await tx.contactProvider.updateMany({
      where: { idProvider: proveedor.id },
      data: { active: false },
    });

    await tx.provider.updateMany({
      where: { id: proveedor.id },
      data: { active: false },
    });

    return { id: proveedor.id };
  }));
}
