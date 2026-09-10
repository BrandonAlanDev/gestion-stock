import "server-only";

import type { Prisma } from "@/../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { EstadoPagoId, PagoWebhookNormalizado } from "@/lib/pagos/tipos";
import { descontarStockPedido } from "@/lib/pedidos/descontar-stock-pedido";

type ClienteTx = Prisma.TransactionClient | typeof prisma;

type MapaEstado = {
  estadoPago: EstadoPagoId;
  cancelar: boolean;
  acreditar: boolean;
};

/** Traduce el estado externo de una pasarela a los estados internos de la plataforma. */
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

async function buscarPayment(
  tx: ClienteTx,
  pedidoId: string,
  tenantId: string,
  externalId: string,
) {
  const porPedido = await tx.payment.findFirst({
    where: { pedidoId, tenantId },
  });

  if (porPedido) return porPedido;

  return tx.payment.findFirst({
    where: { externalId, tenantId },
  });
}

/**
 * Aplica el resultado de un webhook de pago sobre el registro Payment y el
 * Pedido de forma idempotente.
 *
 * La fuente de autoridad del tenant es el propio Pedido (resuelto por
 * external_reference), nunca el valor que llega en la URL del webhook: si el
 * tenant indicado no coincide, se ignora la notificación. El descuento de stock
 * solo ocurre en la primera transición a APROBADO (count === 1), de modo que los
 * webhooks duplicados no vuelven a descontar ni regresan estados.
 */
export async function aplicarWebhookPago(
  tenantIdIndicado: string | null,
  pago: PagoWebhookNormalizado,
): Promise<void> {
  const pedidoId = pago.pedidoId;
  const mapa = mapearEstado(pago.estadoExterno);
  if (!pedidoId || !mapa) return;

  const pedido = await prisma.pedido.findFirst({
    where: { id: pedidoId },
    select: { id: true, tenantId: true, moneda: true },
  });
  if (!pedido) return;
  if (tenantIdIndicado && pedido.tenantId !== tenantIdIndicado) return;

  const tenantId = pedido.tenantId;

  await prisma.$transaction(async (tx) => {
    const payment = await buscarPayment(tx, pedidoId, tenantId, pago.externalId);

    if (!payment) {
      await tx.payment.create({
        data: {
          tenantId,
          pedidoId,
          proveedor: "webhook",
          metodo: "webhook",
          externalId: pago.externalId,
          estado: mapa.estadoPago,
          monto: pago.montoPago ?? 0,
          moneda: pedido.moneda,
        },
      });

      if (mapa.acreditar) {
        await descontarStockPedido(pedidoId, tenantId, tx);
        await tx.pedido.updateMany({
          where: { id: pedidoId, tenantId, estado: "PENDIENTE" },
          data: { estado: "CONFIRMADO", estadoPago: "APROBADO" },
        });
      } else if (mapa.cancelar) {
        await tx.pedido.updateMany({
          where: { id: pedidoId, tenantId },
          data: { estado: "CANCELADO", estadoPago: "CANCELADO" },
        });
      } else {
        await tx.pedido.updateMany({
          where: { id: pedidoId, tenantId },
          data: { estadoPago: mapa.estadoPago },
        });
      }
      return;
    }

    // La cancelación (refund / chargeback) sí puede revertir un APROBADO.
    if (mapa.cancelar) {
      await tx.payment.updateMany({
        where: { id: payment.id },
        data: {
          estado: "CANCELADO",
          externalId: pago.externalId || payment.externalId,
          ...(pago.montoPago != null ? { monto: pago.montoPago } : {}),
        },
      });
      await tx.pedido.updateMany({
        where: { id: pedidoId, tenantId },
        data: { estado: "CANCELADO", estadoPago: "CANCELADO" },
      });
      return;
    }

    // Puerta de idempotencia: nunca se transiciona fuera de APROBADO, y el stock
    // solo se descuenta en la primera transición (count === 1).
    const actualizado = await tx.payment.updateMany({
      where: { id: payment.id, estado: { not: "APROBADO" } },
      data: {
        estado: mapa.estadoPago,
        externalId: pago.externalId || payment.externalId,
        ...(pago.montoPago != null ? { monto: pago.montoPago } : {}),
      },
    });

    if (actualizado.count === 0) return;

    if (mapa.acreditar) {
      await descontarStockPedido(pedidoId, tenantId, tx);
      await tx.pedido.updateMany({
        where: { id: pedidoId, tenantId, estado: "PENDIENTE" },
        data: { estado: "CONFIRMADO", estadoPago: "APROBADO" },
      });
      return;
    }

    await tx.pedido.updateMany({
      where: { id: pedidoId, tenantId },
      data: { estadoPago: mapa.estadoPago },
    });
  });
}
