import "server-only";

import { prisma } from "@/lib/prisma";
import type { PedidoEstadoPagoNombre } from "./evaluar-pago-pedido";

export type DatosActualizarEstadoPago = {
  estadoPago: PedidoEstadoPagoNombre;
  paymentId?: string;
  cancelar?: boolean;
};

/** Actualiza el estado de pago de un pedido (webhook) verificando la pertenencia al comercio. */
export async function actualizarEstadoPagoPedido(
  pedidoId: string,
  tenantId: string,
  datos: DatosActualizarEstadoPago,
) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    select: { id: true, tenantId: true },
  });

  if (!pedido || pedido.tenantId !== tenantId) return null;

  return prisma.pedido.update({
    where: { id: pedidoId },
    data: {
      estadoPago: datos.estadoPago,
      ...(datos.cancelar ? { estado: "CANCELADO" } : {}),
      ...(datos.paymentId ? { mpPaymentId: String(datos.paymentId) } : {}),
    },
  });
}
