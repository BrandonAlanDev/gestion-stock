import "server-only";

import type { Prisma } from "@/../generated/prisma/client";

type ClienteTx = Prisma.TransactionClient;

/** Reserva stock y registra el egreso dentro de la transacción que crea el pedido. */
export async function reservarStockPedido(
  pedidoId: string,
  cliente: ClienteTx,
): Promise<void> {
  const items = await cliente.pedidoItem.findMany({
    where: { pedidoId },
  });
  if (items.length === 0) throw new Error("El pedido no tiene ítems para reservar");

  const variantes = await cliente.garmentVariant.findMany({
    where: { id: { in: items.map((item) => item.variantId) } },
    include: { garment: { select: { controlaStock: true } } },
  });
  const porId = new Map(variantes.map((variante) => [variante.id, variante]));

  for (const item of items) {
    const variante = porId.get(item.variantId);
    if (!variante) throw new Error(`La variante del producto "${item.nombre}" ya no existe`);
    if (!variante.garment.controlaStock) continue;

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

    const marcado = await cliente.pedidoItem.updateMany({
      where: { id: item.id, pedidoId, stockReservado: false },
      data: { stockReservado: true },
    });
    if (marcado.count !== 1) {
      throw new Error(`No se pudo marcar la reserva del producto "${item.nombre}"`);
    }

    await cliente.movement.create({
      data: {
        variantId: item.variantId,
        type: "OUT",
        quantity: item.cantidad,
        priceAtTime: Number(item.precioUnitario),
        note: `Reserva · pedido ${pedidoId}`,
      },
    });
  }
}

/** Convierte los egresos de reserva en egresos de venta tras confirmar el pago. */
export async function confirmarReservaStockPedido(
  pedidoId: string,
  cliente: ClienteTx,
): Promise<void> {
  await cliente.pedidoItem.updateMany({
    where: { pedidoId, stockReservado: true },
    data: { stockReservado: false },
  });
  await cliente.movement.updateMany({
    where: { note: `Reserva · pedido ${pedidoId}` },
    data: { note: `Venta · pedido ${pedidoId}` },
  });
}

/** Devuelve stock solo una vez; el pedido debe estar cancelado y seguir reservado. */
export async function liberarReservaStockPedido(
  pedidoId: string,
  cliente: ClienteTx,
): Promise<boolean> {
  const reclamada = await cliente.pedido.updateMany({
    where: {
      id: pedidoId,
      estado: "CANCELADO",
      stockReservado: true,
    },
    data: { stockReservado: false },
  });
  if (reclamada.count !== 1) return false;

  const items = await cliente.pedidoItem.findMany({
    where: { pedidoId, stockReservado: true },
  });

  for (const item of items) {
    const actualizado = await cliente.garmentVariant.updateMany({
      where: { id: item.variantId },
      data: { stock: { increment: item.cantidad } },
    });
    if (actualizado.count !== 1) {
      throw new Error(`No se pudo liberar el stock del producto "${item.nombre}"`);
    }

    const desmarcado = await cliente.pedidoItem.updateMany({
      where: { id: item.id, pedidoId, stockReservado: true },
      data: { stockReservado: false },
    });
    if (desmarcado.count !== 1) {
      throw new Error(`No se pudo cerrar la reserva del producto "${item.nombre}"`);
    }

    await cliente.movement.create({
      data: {
        variantId: item.variantId,
        type: "IN",
        quantity: item.cantidad,
        priceAtTime: Number(item.precioUnitario),
        note: `Liberación de reserva · pedido ${pedidoId}`,
      },
    });
  }

  return true;
}
