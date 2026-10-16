import type { PrismaClient } from "@/../generated/prisma/client";
import type { MetodoPagoId, PaymentProvider } from "@/lib/pagos/tipos";

export type PedidoConfirmado = {
  id: string;
  estado: string;
  estadoPago: string;
  total: number;
  moneda: string;
  items: Array<{ nombre: string; cantidad: number; precioUnitario: number }>;
};

export type ResultadoConfirmarPago =
  | { ok: true; pedido: PedidoConfirmado }
  | { ok: false; error: string };

export interface DependenciasConfirmarPago {
  obtenerContextoTenant: () => Promise<{
    tenantId: string;
    usuarioId?: string | null;
  } | null>;
  conPrismaTenant: <T>(
    tenantId: string,
    operacion: (prisma: PrismaClient) => Promise<T>,
  ) => Promise<T>;
  obtenerProveedor: (metodo: MetodoPagoId) => PaymentProvider;
  aplicarWebhookPago: (
    tenantId: string,
    pago: {
      externalId: string;
      pedidoId: string | null;
      estadoExterno: string;
      montoPago: number | null;
      monedaPago: string | null;
    },
  ) => Promise<unknown>;
  registrarError: (mensaje: string, detalle: string) => void;
}

export function crearAccionConfirmarPago(dependencias: DependenciasConfirmarPago) {
  async function mapaPedido(pedidoId: string, tenantId: string): Promise<PedidoConfirmado | null> {
    const pedido = await dependencias.conPrismaTenant(tenantId, (prisma) =>
      prisma.pedido.findFirst({
        where: { id: pedidoId, tenantId },
        include: { items: { where: { tenantId } } },
      }),
    );
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

  return async function confirmarPago(
    pedidoId: string,
    paymentId?: string,
  ): Promise<ResultadoConfirmarPago> {
    try {
      if (!pedidoId) return { ok: false, error: "ID de pedido inválido" };

      const contexto = await dependencias.obtenerContextoTenant();
      if (!contexto?.usuarioId) {
        return { ok: false, error: "Iniciá sesión para confirmar tu pago" };
      }

      const pedido = await dependencias.conPrismaTenant(contexto.tenantId, (prisma) =>
        prisma.pedido.findFirst({
          where: { id: pedidoId, tenantId: contexto.tenantId },
          select: { id: true, tenantId: true, userId: true, estado: true, metodoPago: true },
        }),
      );
      if (!pedido) return { ok: false, error: "Pedido no encontrado" };
      if (pedido.tenantId !== contexto.tenantId || pedido.userId !== contexto.usuarioId) {
        return { ok: false, error: "No autorizado" };
      }

      if (paymentId && pedido.estado === "PENDIENTE" && pedido.metodoPago === "mercadopago") {
        const proveedor = dependencias.obtenerProveedor("mercadopago");
        const estado = await proveedor.obtenerEstadoPago(contexto.tenantId, {
          externalId: paymentId,
        });

        await dependencias.aplicarWebhookPago(contexto.tenantId, {
          externalId: estado.externalId,
          pedidoId: estado.referencia,
          estadoExterno: estado.estadoExterno,
          montoPago: estado.montoPago,
          monedaPago: estado.monedaPago,
        });
      }

      const confirmado = await mapaPedido(pedidoId, contexto.tenantId);
      if (!confirmado) return { ok: false, error: "Pedido no encontrado" };
      return { ok: true, pedido: confirmado };
    } catch (error) {
      dependencias.registrarError(
        "Error confirmando pago:",
        error instanceof Error ? error.message : String(error),
      );
      return {
        ok: false,
        error: "No se pudo confirmar el pago. Intentá de nuevo.",
      };
    }
  };
}
