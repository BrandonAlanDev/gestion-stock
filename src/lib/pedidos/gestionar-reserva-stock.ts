import "server-only";

import type { Prisma } from "@/../generated/prisma/client";
import {
  bloquearVariantes,
  obtenerControlStockVariantesBloqueadas,
} from "@/lib/inventario/variantes-transaccion";
import { medirTiempoInventario } from "@/lib/inventario/medir-tiempo-inventario";
import {
  descontarStockCondicional,
  ErrorStockInsuficiente,
} from "@/lib/inventario/stock-condicional";

type ClienteTx = Prisma.TransactionClient;
type ItemReserva = {
  variantId: string;
  nombre: string;
  variante?: string | null;
  imagen?: string | null;
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
  const idsVariantes = items.map((item) => item.variantId);
  if (new Set(idsVariantes).size !== idsVariantes.length) {
    throw new Error("El pedido contiene variantes duplicadas y no se puede reservar");
  }

  const bloqueadas = await bloquearVariantes(cliente, idsVariantes);
  if (bloqueadas.length !== idsVariantes.length) {
    throw new Error("Una variante del pedido ya no está disponible");
  }

  const controlStock = await medirTiempoInventario("reserva.consultar_control_stock", items.length, () =>
    obtenerControlStockVariantesBloqueadas(cliente, idsVariantes),
  );
  const reservables: ItemReserva[] = [];

  for (const item of items) {
    const controlaStock = controlStock.get(item.variantId);
    if (controlaStock === undefined) throw new Error(`La variante del producto "${item.nombre}" ya no existe`);
    if (!controlaStock) continue;
    if (!Number.isSafeInteger(item.cantidad) || item.cantidad < 1) {
      throw new Error("La cantidad a reservar no es válida");
    }
    reservables.push(item);
  }

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
    throw new Error("La reserva del pedido ya existe o no se pudieron reclamar todos sus ítems");
  }

  await medirTiempoInventario("reserva.actualizar_stock", reservables.length, async () => {
    for (const item of reservables) {
      const descontado = await descontarStockCondicional(cliente, item.variantId, item.cantidad);
      if (!descontado) {
        throw new ErrorStockInsuficiente(item.nombre, {
          variantId: item.variantId,
          nombre: item.nombre,
          variante: item.variante ?? null,
          imagen: item.imagen ?? null,
        });
      }
    }
  });

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

  const bloqueadas = await bloquearVariantes(cliente, items.map((item) => item.variantId));
  if (bloqueadas.length !== new Set(items.map((item) => item.variantId)).size) {
    throw new Error("Una variante de la reserva ya no existe");
  }

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
