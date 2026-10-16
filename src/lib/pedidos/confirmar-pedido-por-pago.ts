import "server-only";

import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import { evaluarPagoPedido } from "./evaluar-pago-pedido";
import { descontarStockPedido } from "./descontar-stock-pedido";
import { confirmarReservaStockPedido } from "./gestionar-reserva-stock";

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
  return conPrismaTenant(argumentos.tenantId, async (prisma) => prisma.$transaction(async (tx) => {
  const pedido = await tx.pedido.findFirst({
    where: { id: argumentos.pedidoId, tenantId: argumentos.tenantId },
    select: {
      id: true,
      tenantId: true,
      estado: true,
      total: true,
      stockReservado: true,
    },
  });

  if (!pedido) return { ok: false, error: "Pedido no encontrado" };
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

  const resultado = await tx.pedido.updateMany({
    where: { id: pedido.id, tenantId: argumentos.tenantId, estado: "PENDIENTE" },
    data: {
      estado: validacion.estado,
      estadoPago: validacion.estadoPago,
      ...(argumentos.paymentId
        ? { mpPaymentId: String(argumentos.paymentId) }
        : {}),
      stockReservado: false,
    },
  });

  if (resultado.count === 0) {
    return { ok: true, yaConfirmado: true, pedidoId: pedido.id };
  }

  if (pedido.stockReservado) {
    await confirmarReservaStockPedido(pedido.id, pedido.tenantId, tx);
  } else {
    // Pedidos anteriores al despliegue todavía no tienen stock reservado.
    await descontarStockPedido(pedido.id, pedido.tenantId, tx);
  }

  return { ok: true, pedidoId: pedido.id };
  }));
}
