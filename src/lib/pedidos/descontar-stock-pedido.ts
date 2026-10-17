import "server-only";

import type { Prisma } from "@/../generated/prisma/client";

type ClienteTx = Prisma.TransactionClient;

/**
 * Descuenta el stock de las variantes de un pedido y registra un movimiento
 * de egreso por ítem, de forma atómica. Solo descuenta productos que controlan
 * stock. El llamado debe garantizar la idempotencia (solo se invoca una vez) y
 * el recorrido se hace en una única transacción para evitar parcialidades.
 */
export async function descontarStockPedido(
  pedidoId: string,
  cliente: ClienteTx,
) {
  const items = await cliente.pedidoItem.findMany({
    where: { pedidoId },
  });

  if (!items.length) return;

  const variantes = await cliente.garmentVariant.findMany({
    where: { id: { in: items.map((item) => item.variantId) } },
    include: { garment: { select: { controlaStock: true } } },
  });

  const controlaStock = new Map(
    variantes.map((variante) => [variante.id, variante.garment.controlaStock]),
  );

  for (const item of items) {
    if (!controlaStock.get(item.variantId)) continue;

    const actualizado = await cliente.garmentVariant.updateMany({
      where: {
        id: item.variantId,
        stock: { gte: item.cantidad },
      },
      data: { stock: { decrement: item.cantidad } },
    });

    if (actualizado.count === 0) {
      throw new Error(`Stock insuficiente para el producto "${item.nombre}"`);
    }

    await cliente.movement.create({
      data: {
        variantId: item.variantId,
        type: "OUT",
        quantity: item.cantidad,
        priceAtTime: Number(item.precioUnitario),
        note: `Venta · pedido ${pedidoId}`,
      },
    });
  }
}
