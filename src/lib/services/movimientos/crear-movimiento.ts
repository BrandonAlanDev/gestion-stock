import "server-only";

import { conPrisma } from "@/lib/prisma";

interface DatosMovimiento {
  variantId: string;
  type: "IN" | "OUT";
  quantity: number;
  priceAtTime: number;
  note?: string;
}

export async function crearMovimiento(
  tenantId: string,
  datos: DatosMovimiento,
) {
  return conPrisma((prisma) => prisma.$transaction(async (tx) => {
    const variante = await tx.garmentVariant.findFirst({
      where: { id: datos.variantId },
      select: { id: true },
    });
    if (!variante) throw new Error("Variante no encontrada");

    const ajuste = datos.type === "IN" ? datos.quantity : -datos.quantity;
    const actualizado = await tx.garmentVariant.updateMany({
      where: {
        id: variante.id,
        ...(datos.type === "OUT" ? { stock: { gte: datos.quantity } } : {}),
      },
      data: { stock: { increment: ajuste } },
    });

    if (actualizado.count === 0) {
      throw new Error("Stock insuficiente para realizar el egreso");
    }

    return tx.movement.create({
      data: {
        variantId: variante.id,
        type: datos.type,
        quantity: datos.quantity,
        priceAtTime: datos.priceAtTime,
        note: datos.note || null,
      },
    });
  }));
}
