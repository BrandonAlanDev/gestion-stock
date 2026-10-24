import "server-only";

import type { Prisma } from "@/../generated/prisma/client";
import {
  confirmarReservaStockPedido,
  liberarReservaStockPedido,
} from "./gestionar-reserva-stock";
import { descontarStockPedido } from "./descontar-stock-pedido";

type ClienteTx = Prisma.TransactionClient;

/** Confirma efectivo o transferencia mientras el pedido y su reserva siguen vigentes. */
export async function confirmarPagoManualEnTransaccion(
  tx: ClienteTx,
  pedidoId: string,
  usuarioId: string,
  obtenerAhora: () => Date,
): Promise<boolean> {
  const pedido = await tx.pedido.findUnique({
    where: { id: pedidoId },
    select: {
      estado: true,
      estadoPago: true,
      metodoPago: true,
      stockReservado: true,
      reservaExpiraEn: true,
    },
  });
  if (!pedido || pedido.estado !== "PENDIENTE") return false;
  if (pedido.metodoPago !== "efectivo" && pedido.metodoPago !== "transferencia") return false;
  if (pedido.metodoPago === "efectivo" && pedido.estadoPago !== "PENDIENTE") return false;
  if (pedido.metodoPago === "transferencia" &&
    pedido.estadoPago !== "PENDIENTE" && pedido.estadoPago !== "EN_ACREDITACION") return false;
  const pago = await tx.payment.findFirst({
    where: {
      pedidoId,
      proveedor: pedido.metodoPago,
      estado: pedido.estadoPago,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!pago) return false;
  const ahora = obtenerAhora();
  const venceMientrasPendiente = pedido.estadoPago === "PENDIENTE";
  if (venceMientrasPendiente && pedido.reservaExpiraEn && pedido.reservaExpiraEn <= ahora) return false;

  const metodoPago = pedido.metodoPago;
  const cambio = await tx.pedido.updateMany({
    where: {
      id: pedidoId,
      estado: "PENDIENTE",
      estadoPago: pedido.estadoPago,
      metodoPago,
      ...(venceMientrasPendiente
        ? {
            OR: [
              { reservaExpiraEn: null },
              { reservaExpiraEn: { gt: ahora } },
            ],
          }
        : {}),
    },
    data: { estado: "CONFIRMADO", estadoPago: "APROBADO", stockReservado: false },
  });
  if (cambio.count !== 1) return false;
  if (pedido.stockReservado) await confirmarReservaStockPedido(pedidoId, tx);
  else await descontarStockPedido(pedidoId, tx);

  const pagoActualizado = await tx.payment.updateMany({
    where: {
      id: pago.id,
      pedidoId,
      proveedor: metodoPago,
      estado: pedido.estadoPago,
    },
    data: { estado: "APROBADO" },
  });
  if (pagoActualizado.count !== 1) throw new Error("No se pudo actualizar el registro del pago manual");
  await tx.pedidoEvento.create({
    data: {
      pedidoId,
      tipo: "PAGO_APROBADO",
      descripcion: metodoPago === "efectivo"
        ? "Pago en efectivo confirmado por administración"
        : "Pago por transferencia aprobado por administración",
      estadoAnterior: pedido.estadoPago,
      estadoNuevo: "APROBADO",
      usuarioId,
    },
  });
  return true;
}

/** Rechaza una transferencia y libera su reserva una sola vez. */
export async function rechazarTransferenciaEnTransaccion(
  tx: ClienteTx,
  pedidoId: string,
  usuarioId: string,
): Promise<boolean> {
  const pedido = await tx.pedido.findUnique({
    where: { id: pedidoId },
    select: { estado: true, estadoPago: true, metodoPago: true, stockReservado: true },
  });
  if (!pedido || pedido.metodoPago !== "transferencia" || pedido.estado !== "PENDIENTE" ||
    (pedido.estadoPago !== "PENDIENTE" && pedido.estadoPago !== "EN_ACREDITACION")) return false;
  const pago = await tx.payment.findFirst({
    where: { pedidoId, proveedor: "transferencia", estado: pedido.estadoPago },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!pago) return false;

  const cambio = await tx.pedido.updateMany({
    where: {
      id: pedidoId,
      estado: "PENDIENTE",
      estadoPago: pedido.estadoPago,
      metodoPago: "transferencia",
    },
    data: { estado: "CANCELADO", estadoPago: "RECHAZADO" },
  });
  if (cambio.count !== 1) return false;
  if (pedido.stockReservado && !await liberarReservaStockPedido(pedidoId, tx)) {
    throw new Error("No se pudo liberar el stock de la transferencia rechazada");
  }
  const pagoActualizado = await tx.payment.updateMany({
    where: {
      id: pago.id,
      pedidoId,
      proveedor: "transferencia",
      estado: pedido.estadoPago,
    },
    data: { estado: "RECHAZADO" },
  });
  if (pagoActualizado.count !== 1) throw new Error("No se pudo actualizar el registro de transferencia");
  await tx.pedidoEvento.create({
    data: {
      pedidoId,
      tipo: "PAGO_RECHAZADO",
      descripcion: "Administración rechazó la transferencia y canceló el pedido",
      estadoAnterior: pedido.estadoPago,
      estadoNuevo: "RECHAZADO",
      usuarioId,
    },
  });
  return true;
}
