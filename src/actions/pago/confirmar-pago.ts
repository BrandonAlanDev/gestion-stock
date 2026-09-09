"use server";

import "server-only";
import { prisma } from "@/lib/prisma";
import { obtenerContextoTenant } from "@/lib/tenants/obtener-contexto-tenant";
import { obtenerProveedor } from "@/lib/pagos/registro";
import { aplicarWebhookPago } from "@/lib/pagos/aplicar-webhook-pago";

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

/**
 * Confirma el pago de un pedido verificándolo contra la pasarela. Unicamente la
 * URL de éxito dispara esta verificación; la confirmación real la garantiza el
 * webhook. Si no llega el ID del pago, se devuelve el estado actual del pedido.
 */
export async function confirmarPago(
  pedidoId: string,
  paymentId?: string,
): Promise<ResultadoConfirmarPago> {
  try {
    if (!pedidoId) return { ok: false, error: "ID de pedido inválido" };

    const contexto = await obtenerContextoTenant();
    if (!contexto?.usuarioId) {
      return { ok: false, error: "Iniciá sesión para confirmar tu pago" };
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: { id: true, tenantId: true, userId: true, estado: true, metodoPago: true },
    });
    if (!pedido) return { ok: false, error: "Pedido no encontrado" };
    if (pedido.tenantId !== contexto.tenantId) {
      return { ok: false, error: "No autorizado" };
    }

    if (paymentId && pedido.estado === "PENDIENTE") {
      const proveedor = obtenerProveedor(
        pedido.metodoPago === "transferencia" ? "transferencia" : "mercadopago",
      );
      const estado = await proveedor.obtenerEstadoPago(contexto.tenantId, {
        externalId: paymentId,
      });

      await aplicarWebhookPago(contexto.tenantId, {
        externalId: estado.externalId,
        pedidoId: estado.referencia ?? pedidoId,
        estadoExterno: estado.estadoExterno,
        montoPago: estado.montoPago,
      });
    }

    const confirmado = await mapaPedido(pedidoId);
    if (!confirmado) return { ok: false, error: "Pedido no encontrado" };
    return { ok: true, pedido: confirmado };
  } catch (error) {
    console.error(
      "Error confirmando pago:",
      error instanceof Error ? error.message : String(error),
    );
    return {
      ok: false,
      error: "No se pudo confirmar el pago. Intentá de nuevo.",
    };
  }
}
