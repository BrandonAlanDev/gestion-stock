import "server-only";

import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import { liberarReservaStockPedido } from "./gestionar-reserva-stock";
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
  return conPrismaTenant(tenantId, async (prisma) => prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findFirst({
      where: { id: pedidoId, tenantId },
      select: { id: true, estado: true, stockReservado: true },
    });

    if (!pedido) return null;

    const actualizado = await tx.pedido.updateMany({
      where: { id: pedidoId, tenantId, estado: pedido.estado },
      data: {
        estadoPago: datos.estadoPago,
        ...(datos.cancelar ? { estado: "CANCELADO" } : {}),
        ...(datos.paymentId ? { mpPaymentId: String(datos.paymentId) } : {}),
      },
    });
    if (actualizado.count !== 1) return null;

    if (datos.cancelar && pedido.stockReservado) {
      const liberada = await liberarReservaStockPedido(pedidoId, tenantId, tx);
      if (!liberada) throw new Error("No se pudo liberar la reserva del pedido");
    }

    return tx.pedido.findFirst({ where: { id: pedidoId, tenantId } });
  }));
}
