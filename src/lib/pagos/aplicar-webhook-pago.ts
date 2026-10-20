import "server-only";

import type { Prisma, PrismaClient } from "@/../generated/prisma/client";
import { conPrisma } from "@/lib/prisma";
import type { EstadoPagoId, PagoWebhookNormalizado } from "./tipos";
import { descontarStockPedido } from "../pedidos/descontar-stock-pedido";
import {
  confirmarReservaStockPedido,
  liberarReservaStockPedido,
} from "../pedidos/gestionar-reserva-stock";

type ClienteTx = Prisma.TransactionClient;

type MapaEstado = {
  estadoPago: EstadoPagoId;
  cancelar: boolean;
  acreditar: boolean;
};

const ERROR_REVERTIR_PAGO_SIN_PEDIDO = "PAYMENT_ORDER_TRANSITION_FAILED";

type EjecutarConPrisma = <T>(
  operacion: (prisma: PrismaClient) => Promise<T>,
) => Promise<T>;

export interface DependenciasAplicadorWebhookPago {
  conPrisma: EjecutarConPrisma;
  descontarStockPedido: typeof descontarStockPedido;
  confirmarReservaStockPedido: typeof confirmarReservaStockPedido;
  liberarReservaStockPedido: typeof liberarReservaStockPedido;
}

function mapearEstado(estadoExterno: string): MapaEstado | null {
  switch (estadoExterno) {
    case "approved":
      return { estadoPago: "APROBADO", cancelar: false, acreditar: true };
    case "pending":
    case "in_process":
      return { estadoPago: "EN_ACREDITACION", cancelar: false, acreditar: false };
    case "rejected":
      return { estadoPago: "RECHAZADO", cancelar: false, acreditar: false };
    case "cancelled":
    case "refunded":
    case "charged_back":
      return { estadoPago: "CANCELADO", cancelar: true, acreditar: false };
    default:
      return null;
  }
}

async function buscarOCrearPayment(
  tx: ClienteTx,
  pedidoId: string,
  externalId: string,
  monto: number,
  moneda: string,
) {
  const asociado = await tx.payment.findFirst({
    where: { proveedor: "mercadopago", externalId },
  });
  if (asociado) return asociado.pedidoId === pedidoId ? asociado : null;

  const pendiente = await tx.payment.findFirst({
    where: { pedidoId, proveedor: "mercadopago", externalId: null, estado: "PENDIENTE" },
    orderBy: { createdAt: "asc" },
  });
  if (pendiente) {
    const asociadoAhora = await tx.payment.updateMany({
      where: { id: pendiente.id, externalId: null, estado: "PENDIENTE" },
      data: { externalId },
    });
    if (asociadoAhora.count === 1) return { ...pendiente, externalId };
  }

  try {
    return await tx.payment.create({
      data: {
        pedidoId,
        proveedor: "mercadopago",
        metodo: "mercadopago",
        externalId,
        estado: "PENDIENTE",
        monto,
        moneda,
      },
    });
  } catch (error) {
    const esDuplicado =
      typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
    if (!esDuplicado) throw error;
    const existente = await tx.payment.findFirst({
      where: { proveedor: "mercadopago", externalId },
    });
    return existente?.pedidoId === pedidoId ? existente : null;
  }
}

/** Crea el aplicador para permitir probar las transiciones con un cliente transaccional aislado. */
export function crearAplicadorWebhookPago(
  dependencias: DependenciasAplicadorWebhookPago,
): (pago: PagoWebhookNormalizado) => Promise<void> {
  return async function aplicarWebhookPago(
    pago: PagoWebhookNormalizado,
  ): Promise<void> {
    const pedidoId = pago.pedidoId;
    const mapa = mapearEstado(pago.estadoExterno);
    if (!pedidoId || !pago.externalId || !mapa) return;

    try {
      await dependencias.conPrisma((prisma) =>
        prisma.$transaction(async (tx) => {
          const pedido = await tx.pedido.findFirst({
            where: { id: pedidoId },
            select: {
              id: true,
              total: true,
              moneda: true,
              metodoPago: true,
              estado: true,
              estadoPago: true,
              stockReservado: true,
              mpPreferenceId: true,
              mpPaymentId: true,
            },
          });
          if (!pedido || pedido.metodoPago !== "mercadopago" ||
              !pedido.mpPreferenceId || pedido.mpPreferenceId !== pago.preferenceId) return;
          if (pedido.estado === "CANCELADO" && !mapa.acreditar) return;

          const montoEsperado = Math.round(Number(pedido.total) * 100);
          const montoRecibido = pago.montoPago;
          if (
            montoRecibido === null ||
            !Number.isFinite(montoRecibido) ||
            Math.round(montoRecibido * 100) !== montoEsperado ||
            pago.monedaPago !== pedido.moneda
          ) {
            console.error("Se ignoró un pago con monto o moneda distintos al pedido", pedidoId);
            return;
          }

          const payment = await buscarOCrearPayment(
            tx,
            pedidoId,
            pago.externalId,
            montoRecibido,
            pedido.moneda,
          );
          if (!payment) return;

          if (mapa.acreditar) {
            if (pedido.estado === "CANCELADO") {
              const pagoTardio = await tx.payment.updateMany({
                where: {
                  id: payment.id,
                  pedidoId,
                  proveedor: "mercadopago",
                  externalId: pago.externalId,
                  estado: { not: "APROBADO" },
                },
                data: { estado: "APROBADO", monto: montoRecibido },
              });
              if (pagoTardio.count === 1) {
                console.error(
                  "Pago aprobado después de cancelar el pedido; requiere revisión de reembolso",
                  pedidoId,
                );
              }
              return;
            }

            if (pedido.estado === "CONFIRMADO" && pedido.mpPaymentId === pago.externalId) {
              await tx.payment.updateMany({
                where: {
                  id: payment.id,
                  pedidoId,
                  proveedor: "mercadopago",
                  externalId: pago.externalId,
                  estado: { not: "CANCELADO" },
                },
                data: { estado: "APROBADO", monto: montoRecibido },
              });
              return;
            }

            if (pedido.estado !== "PENDIENTE") return;

            const actualizado = await tx.payment.updateMany({
              where: {
                id: payment.id,
                pedidoId,
                proveedor: "mercadopago",
                externalId: pago.externalId,
                estado: { notIn: ["CANCELADO", "APROBADO"] },
              },
              data: { estado: "APROBADO", monto: montoRecibido },
            });
            if (actualizado.count !== 1) return;

            const confirmado = await tx.pedido.updateMany({
              where: { id: pedidoId, estado: "PENDIENTE" },
              data: {
                estado: "CONFIRMADO",
                estadoPago: "APROBADO",
                mpPaymentId: pago.externalId,
                stockReservado: false,
              },
            });
            if (confirmado.count !== 1) {
              // Evita confirmar el Payment si otra operación ganó la transición del pedido.
              throw new Error(ERROR_REVERTIR_PAGO_SIN_PEDIDO);
            }

            if (pedido.stockReservado) {
              await dependencias.confirmarReservaStockPedido(pedidoId, tx);
            } else {
              // Pedidos anteriores al despliegue no tienen stock reservado.
              await dependencias.descontarStockPedido(pedidoId, tx);
            }
            await tx.pedidoEvento.create({ data: {
              pedidoId, tipo: "PAGO_APROBADO", descripcion: "Pago acreditado por Mercado Pago",
              estadoAnterior: pedido.estadoPago, estadoNuevo: "APROBADO",
            } });
            return;
          }

          const actualizado = await tx.payment.updateMany({
            where: {
              id: payment.id,
              pedidoId,
              proveedor: "mercadopago",
              externalId: pago.externalId,
              estado: mapa.cancelar
                ? { not: "CANCELADO" }
                : { notIn: ["CANCELADO", "APROBADO"] },
            },
            data: {
              externalId: pago.externalId,
              estado: mapa.estadoPago,
              monto: montoRecibido,
            },
          });
          if (actualizado.count !== 1) return;

          if (mapa.cancelar) {
            const cancelado = await tx.pedido.updateMany({
              where: { id: pedidoId, estado: pedido.estado },
              data: { estado: "CANCELADO", estadoPago: "CANCELADO" },
            });
            if (cancelado.count === 1 && pedido.stockReservado) {
              const liberada = await dependencias.liberarReservaStockPedido(
                pedidoId,
                tx,
              );
              if (!liberada) throw new Error("No se pudo liberar la reserva del pedido");
            }
            if (cancelado.count === 1) await tx.pedidoEvento.create({ data: {
              pedidoId, tipo: "CANCELADO", descripcion: "Pago cancelado por Mercado Pago",
              estadoAnterior: pedido.estadoPago, estadoNuevo: "CANCELADO",
            } });
            return;
          }

          const cambioEstado = await tx.pedido.updateMany({
            where: { id: pedidoId, estado: "PENDIENTE" },
            data: { estadoPago: mapa.estadoPago },
          });
          if (cambioEstado.count === 1 && pedido.estadoPago !== mapa.estadoPago) {
            await tx.pedidoEvento.create({ data: {
              pedidoId,
              tipo: mapa.estadoPago === "RECHAZADO" ? "PAGO_RECHAZADO" : "PAGO_EN_ACREDITACION",
              descripcion: mapa.estadoPago === "RECHAZADO" ? "Pago rechazado por Mercado Pago" : "Pago pendiente de acreditación",
              estadoAnterior: pedido.estadoPago,
              estadoNuevo: mapa.estadoPago,
            } });
          }
      }));
    } catch (error) {
      if (error instanceof Error && error.message === ERROR_REVERTIR_PAGO_SIN_PEDIDO) return;
      throw error;
    }
  };
}

/** Aplica una notificación verificada por la pasarela. */
export const aplicarWebhookPago = crearAplicadorWebhookPago({
  conPrisma,
  descontarStockPedido,
  confirmarReservaStockPedido,
  liberarReservaStockPedido,
});
