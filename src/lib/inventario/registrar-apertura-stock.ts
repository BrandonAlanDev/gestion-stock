import "server-only";

import type { Prisma } from "@/../generated/prisma/client";

type VarianteApertura = {
  variantId: string;
  cantidad: number;
  precio: number;
};

/** Registra el saldo vigente como apertura cuando comienza el seguimiento del inventario. */
export async function registrarAperturaStock(
  tx: Prisma.TransactionClient,
  variantes: readonly VarianteApertura[],
  nota: string,
): Promise<void> {
  const conStock = variantes.filter((variante) => variante.cantidad > 0);
  if (conStock.length === 0) return;

  await tx.movement.createMany({
    data: conStock.map((variante) => ({
      variantId: variante.variantId,
      type: "IN",
      quantity: variante.cantidad,
      priceAtTime: variante.precio,
      note: nota,
    })),
  });
}
