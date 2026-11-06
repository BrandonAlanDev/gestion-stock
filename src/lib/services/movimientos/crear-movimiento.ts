import "server-only";

import { conPrismaTenant } from "@/lib/prisma";
import { bloquearVariantes } from "@/lib/inventario/variantes-transaccion";
import { descontarStockCondicional } from "@/lib/inventario/stock-condicional";

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
  if (!Number.isSafeInteger(datos.quantity) || datos.quantity < 1) {
    throw new Error("La cantidad del movimiento no es válida");
  }

  return conPrismaTenant(tenantId, (prisma) => prisma.$transaction(async (tx) => {
    const bloqueadas = await bloquearVariantes(tx, [datos.variantId]);
    if (bloqueadas.length !== 1) throw new Error("Variante no encontrada");

    const variante = await tx.garmentVariant.findFirst({
      where: { id: datos.variantId },
      select: { id: true },
    });
    if (!variante) throw new Error("Variante no encontrada");

    const ajuste = datos.type === "IN" ? datos.quantity : -datos.quantity;
    const actualizado = datos.type === "OUT"
      ? await descontarStockCondicional(tx, variante.id, datos.quantity)
      : (await tx.garmentVariant.updateMany({
          where: { id: variante.id },
          data: { stock: { increment: ajuste } },
        })).count === 1;

    if (!actualizado) {
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
