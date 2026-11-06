import "server-only";

import type { Prisma } from "@/../generated/prisma/client";
import { medirTiempoInventario } from "@/lib/inventario/medir-tiempo-inventario";

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
    select: {
      id: true,
      stock: true,
      garment: { select: { controlaStock: true } },
    },
  });

  const porId = new Map(variantes.map((variante) => [variante.id, variante]));
  const descontables = items.filter((item) => {
    const variante = porId.get(item.variantId);
    if (!variante) throw new Error(`La variante del producto "${item.nombre}" ya no existe`);
    if (!variante.garment.controlaStock) return false;
    if (variante.stock < item.cantidad) {
      throw new Error(`Stock insuficiente para el producto "${item.nombre}"`);
    }
    return true;
  });

  await medirTiempoInventario("venta.actualizar_stock", descontables.length, async () => {
    for (const item of descontables) {
      const actualizado = await cliente.garmentVariant.updateMany({
        where: {
          id: item.variantId,
          stock: { gte: item.cantidad },
        },
        data: { stock: { decrement: item.cantidad } },
      });

      if (actualizado.count !== 1) {
        throw new Error(`Stock insuficiente para el producto "${item.nombre}"`);
      }
    }
  });

  if (descontables.length > 0) {
    await cliente.movement.createMany({
      data: descontables.map((item) => ({
        variantId: item.variantId,
        type: "OUT",
        quantity: item.cantidad,
        priceAtTime: Number(item.precioUnitario),
        note: `Venta · pedido ${pedidoId}`,
      })),
    });
  }
}
