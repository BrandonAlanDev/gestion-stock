import "server-only";

import type { Prisma } from "@/../generated/prisma/client";
import { medirTiempoInventario } from "@/lib/inventario/medir-tiempo-inventario";

type ClienteTx = Prisma.TransactionClient;
type ItemReserva = {
  variantId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
};

/** Reserva stock y registra el egreso dentro de la transacción que crea el pedido. */
export async function reservarStockPedido(
  pedidoId: string,
  items: readonly ItemReserva[],
  cliente: ClienteTx,
): Promise<void> {
  if (items.length === 0) throw new Error("El pedido no tiene ítems para reservar");

  const variantes = await medirTiempoInventario("reserva.consultar_variantes", items.length, () =>
    cliente.garmentVariant.findMany({
      where: { id: { in: items.map((item) => item.variantId) } },
      select: {
        id: true,
        stock: true,
        garment: { select: { controlaStock: true } },
      },
    }),
  );
  const porId = new Map(variantes.map((variante) => [variante.id, variante]));
  const reservables: ItemReserva[] = [];

  for (const item of items) {
    const variante = porId.get(item.variantId);
    if (!variante) throw new Error(`La variante del producto "${item.nombre}" ya no existe`);
    if (!variante.garment.controlaStock) continue;
    if (variante.stock < item.cantidad) {
      throw new Error(`Stock insuficiente para el producto "${item.nombre}"`);
    }
    reservables.push(item);
  }

  await medirTiempoInventario("reserva.actualizar_stock", reservables.length, async () => {
    for (const item of reservables) {
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

  if (reservables.length === 0) return;

  const variantesReservadas = reservables.map((item) => item.variantId);
  const marcados = await medirTiempoInventario("reserva.marcar_items", reservables.length, () =>
    cliente.pedidoItem.updateMany({
      where: {
        pedidoId,
        variantId: { in: variantesReservadas },
        stockReservado: false,
      },
      data: { stockReservado: true },
    }),
  );
  if (marcados.count !== reservables.length) {
    throw new Error("No se pudieron marcar todos los ítems de la reserva");
  }

  await medirTiempoInventario("reserva.registrar_movimientos", reservables.length, () =>
    cliente.movement.createMany({
      data: reservables.map((item) => ({
        variantId: item.variantId,
        type: "OUT",
        quantity: item.cantidad,
        priceAtTime: item.precioUnitario,
        note: `Reserva · pedido ${pedidoId}`,
      })),
    }),
  );
}

/** Convierte los egresos de reserva en egresos de venta tras confirmar el pago. */
export async function confirmarReservaStockPedido(
  pedidoId: string,
  cliente: ClienteTx,
): Promise<void> {
  const items = await cliente.pedidoItem.findMany({
    where: { pedidoId, stockReservado: true },
    select: { variantId: true },
  });
  await cliente.pedidoItem.updateMany({
    where: { pedidoId, stockReservado: true },
    data: { stockReservado: false },
  });
  if (items.length === 0) return;

  await cliente.movement.updateMany({
    where: {
      variantId: { in: [...new Set(items.map((item) => item.variantId))] },
      note: `Reserva · pedido ${pedidoId}`,
    },
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

  await medirTiempoInventario("reserva.liberar_stock", items.length, async () => {
    for (const item of items) {
      const actualizado = await cliente.garmentVariant.updateMany({
        where: { id: item.variantId },
        data: { stock: { increment: item.cantidad } },
      });
      if (actualizado.count !== 1) {
        throw new Error(`No se pudo liberar el stock del producto "${item.nombre}"`);
      }
    }
  });

  if (items.length === 0) return true;

  const desmarcados = await cliente.pedidoItem.updateMany({
    where: { pedidoId, stockReservado: true },
    data: { stockReservado: false },
  });
  if (desmarcados.count !== items.length) {
    throw new Error("No se pudieron cerrar todos los ítems de la reserva");
  }

  await cliente.movement.createMany({
    data: items.map((item) => ({
      variantId: item.variantId,
      type: "IN",
      quantity: item.cantidad,
      priceAtTime: Number(item.precioUnitario),
      note: `Liberación de reserva · pedido ${pedidoId}`,
    })),
  });

  return true;
}
