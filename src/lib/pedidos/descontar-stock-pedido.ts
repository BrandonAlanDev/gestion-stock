import "server-only";

import type { Prisma } from "@/../generated/prisma/client";
import { prisma } from "@/lib/prisma";

type ClienteTx = Prisma.TransactionClient | typeof prisma;

/**
 * Descuenta el stock de las variantes de un pedido y registra un movimiento
 * de egreso por ítem, de forma atómica. Solo descuenta productos que controlan
 * stock. El llamado debe garantizar la idempotencia (solo se invoca una vez) y
 * el recorrido se hace en una única transacción para evitar parcialidades.
 */
export async function descontarStockPedido(
  pedidoId: string,
  tenantId: string,
  cliente: ClienteTx = prisma,
) {
  const items = await cliente.pedidoItem.findMany({
    where: { pedidoId, tenantId },
  });

  if (!items.length) return;

  const variantes = await cliente.garmentVariant.findMany({
    where: { id: { in: items.map((item) => item.variantId) }, tenantId },
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
        tenantId,
        stock: { gte: item.cantidad },
      },
      data: { stock: { decrement: item.cantidad } },
    });

    if (actualizado.count === 0) {
      throw new Error(`Stock insuficiente para el producto "${item.nombre}"`);
    }

    await cliente.movement.create({
      data: {
        tenantId,
        variantId: item.variantId,
        type: "OUT",
        quantity: item.cantidad,
        priceAtTime: Number(item.precioUnitario),
        note: `Venta · pedido ${pedidoId}`,
      },
    });
  }
}
