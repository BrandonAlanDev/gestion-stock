"use server";

import "server-only";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import { obtenerContextoTenant } from "@/lib/tenants/obtener-contexto-tenant";
import { obtenerProveedor } from "@/lib/pagos/registro";
import { aplicarWebhookPago } from "@/lib/pagos/aplicar-webhook-pago";
import { crearAccionConfirmarPago } from "@/lib/actions/pago/crear-accion-confirmar-pago";

export type {
  PedidoConfirmado,
  ResultadoConfirmarPago,
} from "@/lib/actions/pago/crear-accion-confirmar-pago";

const ejecutarConfirmarPago = crearAccionConfirmarPago({
  obtenerContextoTenant,
  conPrismaTenant,
  obtenerProveedor,
  aplicarWebhookPago,
  registrarError: (mensaje, detalle) => console.error(mensaje, detalle),
});

/**
 * Confirma el pago de un pedido verificándolo contra la pasarela. Unicamente la
 * URL de éxito dispara esta verificación; la confirmación real la garantiza el
 * webhook. Si no llega el ID del pago, se devuelve el estado actual del pedido.
 */
export async function confirmarPago(
  pedidoId: string,
  paymentId?: string,
) {
  return ejecutarConfirmarPago(pedidoId, paymentId);
}
