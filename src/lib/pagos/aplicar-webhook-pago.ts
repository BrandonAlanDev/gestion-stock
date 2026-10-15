import "server-only";

import type { Prisma } from "@/../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { EstadoPagoId, PagoWebhookNormalizado } from "@/lib/pagos/tipos";
import { descontarStockPedido } from "@/lib/pedidos/descontar-stock-pedido";

type ClienteTx = Prisma.TransactionClient;

type MapaEstado = {
  estadoPago: EstadoPagoId;
  cancelar: boolean;
  acreditar: boolean;
};

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
  tenantId: string,
  externalId: string,
  monto: number,
  moneda: string,
) {
  const asociado = await tx.payment.findFirst({
    where: { tenantId, proveedor: "mercadopago", externalId },
  });
  if (asociado) return asociado.pedidoId === pedidoId ? asociado : null;

  const pendiente = await tx.payment.findFirst({
    where: { pedidoId, tenantId, proveedor: "mercadopago", externalId: null, estado: "PENDIENTE" },
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
        tenantId,
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
      where: { tenantId, proveedor: "mercadopago", externalId },
    });
    return existente?.pedidoId === pedidoId ? existente : null;
  }
}

/** Aplica una notificación verificada por la pasarela una sola vez por operación. */
export async function aplicarWebhookPago(
  tenantIdIndicado: string | null,
  pago: PagoWebhookNormalizado,
): Promise<void> {
  const pedidoId = pago.pedidoId;
  const mapa = mapearEstado(pago.estadoExterno);
  if (!pedidoId || !pago.externalId || !mapa) return;

  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    select: {
      id: true,
      tenantId: true,
      total: true,
      moneda: true,
      metodoPago: true,
      estado: true,
      mpPreferenceId: true,
    },
  });
  if (!pedido || pedido.tenantId !== tenantIdIndicado) return;
  if (pedido.metodoPago !== "mercadopago" || !pedido.mpPreferenceId) return;
  if (pedido.estado === "CANCELADO") return;

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

  await prisma.$transaction(async (tx) => {
    const payment = await buscarOCrearPayment(
      tx,
      pedidoId,
      pedido.tenantId,
      pago.externalId,
      montoRecibido,
      pedido.moneda,
    );
    if (!payment) return;

    const actualizado = await tx.payment.updateMany({
      where: {
        id: payment.id,
        tenantId: pedido.tenantId,
        pedidoId,
        proveedor: "mercadopago",
        externalId: payment.externalId,
        estado: { notIn: ["CANCELADO", ...(mapa.cancelar ? [] : ["APROBADO" as const])] },
      },
      data: {
        externalId: pago.externalId,
        estado: mapa.estadoPago,
        monto: montoRecibido,
      },
    });
    if (actualizado.count !== 1) return;

    if (mapa.cancelar) {
      await tx.pedido.updateMany({
        where: { id: pedidoId, tenantId: pedido.tenantId },
        data: { estado: "CANCELADO", estadoPago: "CANCELADO" },
      });
      return;
    }

    if (mapa.acreditar) {
      const confirmado = await tx.pedido.updateMany({
        where: { id: pedidoId, tenantId: pedido.tenantId, estado: "PENDIENTE" },
        data: { estado: "CONFIRMADO", estadoPago: "APROBADO", mpPaymentId: pago.externalId },
      });
      if (confirmado.count === 1) {
        await descontarStockPedido(pedidoId, pedido.tenantId, tx);
      }
      return;
    }

    await tx.pedido.updateMany({
      where: { id: pedidoId, tenantId: pedido.tenantId, estado: "PENDIENTE" },
      data: { estadoPago: mapa.estadoPago },
    });
  });
}
