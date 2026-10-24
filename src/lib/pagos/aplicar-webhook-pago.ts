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

type EstadoPagoWebhook = EstadoPagoId | "REEMBOLSADO";
type TipoEstadoWebhook = "APROBADO" | "EN_ACREDITACION" | "RECHAZADO" | "CANCELADO" | "REEMBOLSADO";

type MapaEstado = {
  tipo: TipoEstadoWebhook;
  estadoPago: EstadoPagoWebhook;
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
      return { tipo: "APROBADO", estadoPago: "APROBADO" };
    case "pending":
    case "in_process":
      return { tipo: "EN_ACREDITACION", estadoPago: "EN_ACREDITACION" };
    case "rejected":
      return { tipo: "RECHAZADO", estadoPago: "RECHAZADO" };
    case "cancelled":
      return { tipo: "CANCELADO", estadoPago: "CANCELADO" };
    case "refunded":
    case "charged_back":
      return { tipo: "REEMBOLSADO", estadoPago: "REEMBOLSADO" };
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

          if (mapa.tipo === "REEMBOLSADO") {
            const payment = await tx.payment.findFirst({
              where: {
                pedidoId,
                proveedor: "mercadopago",
                externalId: pago.externalId,
              },
            });
            if (!payment || payment.estado !== "APROBADO") return;

            const actualizado = await tx.payment.updateMany({
              where: {
                id: payment.id,
                pedidoId,
                proveedor: "mercadopago",
                externalId: pago.externalId,
                estado: "APROBADO",
              },
              data: { estado: "REEMBOLSADO", monto: montoRecibido },
            });
            if (actualizado.count !== 1) return;

            const pagoAceptado =
              pedido.mpPaymentId === pago.externalId && pedido.estadoPago === "APROBADO";
            const pagoAprobadoTarde =
              pedido.estado === "CANCELADO" &&
              pedido.mpPaymentId === null &&
              pedido.estadoPago === "CANCELADO";

            if (pagoAceptado || pagoAprobadoTarde) {
              const reembolsado = await tx.pedido.updateMany({
                where: pagoAceptado
                  ? {
                      id: pedidoId,
                      mpPaymentId: pago.externalId,
                      estadoPago: "APROBADO",
                    }
                  : {
                      id: pedidoId,
                      estado: "CANCELADO",
                      mpPaymentId: null,
                      estadoPago: "CANCELADO",
                    },
                data: { estadoPago: "REEMBOLSADO" },
              });
              if (reembolsado.count !== 1) {
                throw new Error(ERROR_REVERTIR_PAGO_SIN_PEDIDO);
              }
            }

            await tx.pedidoEvento.create({ data: {
              pedidoId,
              tipo: "REEMBOLSADO",
              descripcion: pago.estadoExterno === "charged_back"
                ? "Pago desconocido por contracargo de Mercado Pago"
                : "Pago reembolsado por Mercado Pago",
              estadoAnterior: "APROBADO",
              estadoNuevo: "REEMBOLSADO",
            } });
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

          if (mapa.tipo === "APROBADO") {
            if (pedido.estado === "CANCELADO") {
              const pagoTardio = await tx.payment.updateMany({
                where: {
                  id: payment.id,
                  pedidoId,
                  proveedor: "mercadopago",
                  externalId: pago.externalId,
                  estado: { notIn: ["CANCELADO", "APROBADO", "REEMBOLSADO"] },
                },
                data: { estado: "APROBADO", monto: montoRecibido },
              });
              if (pagoTardio.count === 1) {
                console.error(
                  "Pago aprobado después de cancelar el pedido; requiere revisión de reembolso",
                  pedidoId,
                );
                await tx.pedidoEvento.create({ data: {
                  pedidoId,
                  tipo: "PAGO_APROBADO",
                  descripcion: "Pago aprobado después de cancelar el pedido; requiere revisión",
                  estadoAnterior: pedido.estadoPago,
                  estadoNuevo: "APROBADO",
                } });
              }
              return;
            }

            if (pedido.mpPaymentId === pago.externalId && pedido.estadoPago === "APROBADO") {
              // Un reintento de la notificación no vuelve a tocar el pedido ni el stock.
              await tx.payment.updateMany({
                where: {
                  id: payment.id,
                  pedidoId,
                  proveedor: "mercadopago",
                  externalId: pago.externalId,
                  estado: { notIn: ["CANCELADO", "REEMBOLSADO"] },
                },
                data: { estado: "APROBADO", monto: montoRecibido },
              });
              return;
            }

            if (pedido.estado !== "PENDIENTE") {
              // Guarda el segundo pago aprobado para revisión, sin reemplazar al aceptado.
              const aprobadoAlternativo = await tx.payment.updateMany({
                where: {
                  id: payment.id,
                  pedidoId,
                  proveedor: "mercadopago",
                  externalId: pago.externalId,
                  estado: { notIn: ["CANCELADO", "APROBADO", "REEMBOLSADO"] },
                },
                data: { estado: "APROBADO", monto: montoRecibido },
              });
              if (aprobadoAlternativo.count === 1) {
                console.error(
                  "Pago aprobado para un pedido ya confirmado por otro pago; requiere revisión",
                  pedidoId,
                );
                await tx.pedidoEvento.create({ data: {
                  pedidoId,
                  tipo: "PAGO_APROBADO",
                  descripcion: "Pago adicional aprobado; requiere revisión",
                  estadoAnterior: pedido.estadoPago,
                  estadoNuevo: "APROBADO",
                } });
              }
              return;
            }

            const actualizado = await tx.payment.updateMany({
              where: {
                id: payment.id,
                pedidoId,
                proveedor: "mercadopago",
                externalId: pago.externalId,
                estado: { notIn: ["CANCELADO", "APROBADO", "REEMBOLSADO"] },
              },
              data: { estado: "APROBADO", monto: montoRecibido },
            });
            if (actualizado.count !== 1) return;

            const confirmado = await tx.pedido.updateMany({
              where: {
                id: pedidoId,
                estado: "PENDIENTE",
                estadoPago: { notIn: ["APROBADO", "CANCELADO", "REEMBOLSADO"] },
                mpPaymentId: pedido.mpPaymentId,
              },
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

          if (mapa.tipo === "CANCELADO") {
            const pagoAceptado = pedido.mpPaymentId === pago.externalId;
            const cancelarPedidoPendiente = pedido.estado === "PENDIENTE";
            const actualizado = await tx.payment.updateMany({
              where: {
                id: payment.id,
                pedidoId,
                proveedor: "mercadopago",
                externalId: pago.externalId,
                estado: { notIn: ["CANCELADO", "REEMBOLSADO"] },
              },
              data: { estado: "CANCELADO", monto: montoRecibido },
            });
            if (actualizado.count !== 1) return;

            if (!cancelarPedidoPendiente && !pagoAceptado) return;

            if (cancelarPedidoPendiente) {
              const cancelado = await tx.pedido.updateMany({
                where: {
                  id: pedidoId,
                  estado: "PENDIENTE",
                  estadoPago: { notIn: ["APROBADO", "CANCELADO", "REEMBOLSADO"] },
                  mpPaymentId: pedido.mpPaymentId,
                },
                data: { estado: "CANCELADO", estadoPago: "CANCELADO" },
              });
              if (cancelado.count !== 1) {
                throw new Error(ERROR_REVERTIR_PAGO_SIN_PEDIDO);
              }
              if (pedido.stockReservado) {
                const liberada = await dependencias.liberarReservaStockPedido(
                  pedidoId,
                  tx,
                );
                if (!liberada) throw new Error("No se pudo liberar la reserva del pedido");
              }
              await tx.pedidoEvento.create({ data: {
                pedidoId,
                tipo: "CANCELADO",
                descripcion: "Pago cancelado por Mercado Pago",
                estadoAnterior: pedido.estadoPago,
                estadoNuevo: "CANCELADO",
              } });
              return;
            }

            if (pedido.estadoPago !== "APROBADO") return;
            const cancelado = await tx.pedido.updateMany({
              where: {
                id: pedidoId,
                mpPaymentId: pago.externalId,
                estadoPago: "APROBADO",
              },
              data: { estadoPago: "CANCELADO" },
            });
            if (cancelado.count !== 1) {
              throw new Error(ERROR_REVERTIR_PAGO_SIN_PEDIDO);
            }
            await tx.pedidoEvento.create({ data: {
              pedidoId,
              tipo: "CANCELADO",
              descripcion: "Pago aceptado cancelado por Mercado Pago",
              estadoAnterior: "APROBADO",
              estadoNuevo: "CANCELADO",
            } });
            return;
          }

          const actualizado = await tx.payment.updateMany({
            where: {
              id: payment.id,
              pedidoId,
              proveedor: "mercadopago",
              externalId: pago.externalId,
              estado: mapa.tipo === "EN_ACREDITACION"
                ? { notIn: ["CANCELADO", "APROBADO", "REEMBOLSADO", "RECHAZADO"] }
                : { notIn: ["CANCELADO", "APROBADO", "REEMBOLSADO"] },
            },
            data: {
              externalId: pago.externalId,
              estado: mapa.estadoPago,
              monto: montoRecibido,
            },
          });
          if (actualizado.count !== 1) return;

          const cambioEstado = await tx.pedido.updateMany({
            where: {
              id: pedidoId,
              estado: "PENDIENTE",
              estadoPago: { notIn: ["APROBADO", "CANCELADO", "REEMBOLSADO"] },
              mpPaymentId: pedido.mpPaymentId,
            },
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
