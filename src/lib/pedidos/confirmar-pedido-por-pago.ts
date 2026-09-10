import "server-only";

import { prisma } from "@/lib/prisma";
import { evaluarPagoPedido } from "./evaluar-pago-pedido";

export type ResultadoConfirmacionPago = {
  ok: boolean;
  yaConfirmado?: boolean;
  pedidoId?: string;
  error?: string;
};

export type DatosConfirmarPago = {
  pedidoId: string;
  tenantId: string;
  estadoPago: string;
  referencia: string;
  montoPago: number;
  paymentId?: string;
};

/**
 * Valida un pago de Mercado Pago y confirma el pedido (PENDIENTE → CONFIRMADO).
 * Lo consumen la server action de confirmación y el webhook para evitar lógica
 * duplicada. Es idempotente: usa `updateMany` sobre `estado = PENDIENTE`; si la
 * fila no matchea (`count === 0`) el pedido ya fue procesado y se devuelve
 * `yaConfirmado` sin duplicar efectos.
 */
export async function confirmarPedidoPorPago(
  argumentos: DatosConfirmarPago,
): Promise<ResultadoConfirmacionPago> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: argumentos.pedidoId },
    select: { id: true, tenantId: true, estado: true, total: true },
  });

  if (!pedido) return { ok: false, error: "Pedido no encontrado" };
  if (pedido.tenantId !== argumentos.tenantId) {
    return { ok: false, error: "El pedido no pertenece a este comercio" };
  }

  const validacion = evaluarPagoPedido({
    pedidoId: pedido.id,
    estado: pedido.estado,
    estadoPago: argumentos.estadoPago,
    total: Number(pedido.total),
    montoPago: argumentos.montoPago,
    referencia: argumentos.referencia,
  });

  if (!validacion.ok) return { ok: false, error: validacion.error };
  if (validacion.yaConfirmado) {
    return { ok: true, yaConfirmado: true, pedidoId: pedido.id };
  }

  const resultado = await prisma.pedido.updateMany({
    where: { id: pedido.id, estado: "PENDIENTE" },
    data: {
      estado: validacion.estado,
      estadoPago: validacion.estadoPago,
      ...(argumentos.paymentId
        ? { mpPaymentId: String(argumentos.paymentId) }
        : {}),
    },
  });

  if (resultado.count === 0) {
    return { ok: true, yaConfirmado: true, pedidoId: pedido.id };
  }

  return { ok: true, pedidoId: pedido.id };
}
