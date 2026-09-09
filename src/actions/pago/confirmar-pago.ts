"use server";

import "server-only";
import { Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { obtenerContextoTenant } from "@/lib/tenants/obtener-contexto-tenant";
import { obtenerClienteMP } from "@/lib/mercadopago/obtener-cliente";
import { confirmarPedidoPorPago } from "@/lib/pedidos/confirmar-pedido-por-pago";

export type ResultadoConfirmarPago =
  | { ok: true; pedido: PedidoConfirmado }
  | { ok: false; error: string };

export type PedidoConfirmado = {
  id: string;
  estado: string;
  estadoPago: string;
  total: number;
  moneda: string;
  items: Array<{ nombre: string; cantidad: number; precioUnitario: number }>;
};

async function mapaPedido(pedidoId: string): Promise<PedidoConfirmado | null> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { items: true },
  });
  if (!pedido) return null;
  return {
    id: pedido.id,
    estado: pedido.estado,
    estadoPago: pedido.estadoPago,
    total: Number(pedido.total),
    moneda: pedido.moneda,
    items: pedido.items.map((item) => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
      precioUnitario: Number(item.precioUnitario),
    })),
  };
}

/** Confirma el pago de un pedido verificándolo contra la API de Mercado Pago. */
export async function confirmarPago(
  pedidoId: string,
  paymentId?: string,
): Promise<ResultadoConfirmarPago> {
  try {
    if (!pedidoId) return { ok: false, error: "ID de pedido inválido" };

    const contexto = await obtenerContextoTenant();
    if (!contexto?.usuarioId) return { ok: false, error: "Iniciá sesión para confirmar tu pago" };

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: { id: true, tenantId: true, userId: true, estado: true },
    });
    if (!pedido) return { ok: false, error: "Pedido no encontrado" };
    if (pedido.tenantId !== contexto.tenantId) return { ok: false, error: "No autorizado" };

    if (pedido.estado === "CONFIRMADO") {
      const yaConfirmado = await mapaPedido(pedidoId);
      return yaConfirmado ? { ok: true, pedido: yaConfirmado } : { ok: false, error: "Pedido no encontrado" };
    }

    if (!paymentId) return { ok: false, error: "Falta el ID del pago" };

    const mp = await obtenerClienteMP(contexto.tenantId);
    const payment = new Payment(mp);
    const datosPago = await payment.get({ id: paymentId });

    const resultado = await confirmarPedidoPorPago({
      pedidoId,
      tenantId: contexto.tenantId,
      estadoPago: String(datosPago.status ?? ""),
      referencia: String(datosPago.external_reference ?? ""),
      montoPago: Number(datosPago.transaction_amount ?? 0),
      paymentId: String(datosPago.id),
    });

    if (!resultado.ok) return { ok: false, error: resultado.error ?? "No se pudo confirmar el pago" };

    const confirmado = await mapaPedido(pedidoId);
    return confirmado ? { ok: true, pedido: confirmado } : { ok: false, error: "Pedido no encontrado" };
  } catch (error) {
    console.error(
      "Error confirmando pago:",
      error instanceof Error ? error.message : String(error),
    );
    return { ok: false, error: "No se pudo confirmar el pago. Intentá de nuevo." };
  }
}
