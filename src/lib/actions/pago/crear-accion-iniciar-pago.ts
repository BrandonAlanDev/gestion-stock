import type { PrismaClient } from "@/../generated/prisma/client";
import type { ItemParaCrearPedido } from "@/lib/pedidos/crear-pedido";
import type { ResumenMetodoPago } from "@/lib/pagos/obtener-metodos-disponibles";
import type { MetodoPagoId, PaymentProvider } from "@/lib/pagos/tipos";
import { liberarReservaStockPedido } from "@/lib/pedidos/gestionar-reserva-stock";

export type ResultadoIniciarPago =
  | {
      ok: true;
      pedidoId: string;
      paymentId: string;
      checkoutUrl: string | null;
      instrucciones: string | null;
      esSandbox: boolean;
    }
  | { ok: false; error: string };

export interface DependenciasIniciarPago {
  obtenerContextoTenant: () => Promise<{
    tenantId: string;
    usuarioId?: string | null;
  } | null>;
  obtenerMetodosPagoDisponibles: (tenantId: string) => Promise<ResumenMetodoPago[]>;
  filtrarMetodosDisponibles: (
    metodos: ResumenMetodoPago[],
  ) => Array<Pick<ResumenMetodoPago, "id">>;
  obtenerBaseUrl: () => Promise<string>;
  crearPedidoDesdeCarrito: (
    tenantId: string,
    userId: string,
    items: ItemParaCrearPedido[],
    metodoPago: MetodoPagoId,
  ) => Promise<{ pedidoId: string }>;
  conPrismaTenant: <T>(
    tenantId: string,
    operacion: (prisma: PrismaClient) => Promise<T>,
  ) => Promise<T>;
  liberarReservaStockPedido: typeof liberarReservaStockPedido;
  obtenerProveedor: (metodo: MetodoPagoId) => PaymentProvider;
  registrarError: (mensaje: string, detalle: string) => void;
}

export function crearAccionIniciarPago(dependencias: DependenciasIniciarPago) {
  return async function iniciarPago(
    metodo: MetodoPagoId,
    items: ItemParaCrearPedido[],
  ): Promise<ResultadoIniciarPago> {
    let pedidoIdCreado: string | null = null;
    let tenantIdProcesado: string | null = null;
    try {
      const contexto = await dependencias.obtenerContextoTenant();
      if (!contexto?.usuarioId) {
        return { ok: false, error: "Debés iniciar sesión para confirmar el pago" };
      }
      tenantIdProcesado = contexto.tenantId;

      const disponibles = dependencias.filtrarMetodosDisponibles(
        await dependencias.obtenerMetodosPagoDisponibles(contexto.tenantId),
      );
      const seleccionado = disponibles.find((metodoDisponible) => metodoDisponible.id === metodo);
      if (!seleccionado) {
        return { ok: false, error: "El método de pago no está disponible" };
      }

      const baseUrl = await dependencias.obtenerBaseUrl();
      const creado = await dependencias.crearPedidoDesdeCarrito(
        contexto.tenantId,
        contexto.usuarioId,
        items,
        metodo,
      );
      pedidoIdCreado = creado.pedidoId;

      const pedido = await dependencias.conPrismaTenant(contexto.tenantId, (prisma) =>
        prisma.pedido.findFirst({
          where: { id: creado.pedidoId, tenantId: contexto.tenantId },
          include: {
            user: { select: { name: true, email: true } },
            items: { select: { nombre: true, cantidad: true, precioUnitario: true } },
          },
        }),
      );
      if (!pedido) throw new Error("No se pudo crear el pedido");
      if (
        metodo === "mercadopago" &&
        (!pedido.reservaExpiraEn || pedido.reservaExpiraEn <= new Date())
      ) {
        throw new Error("La reserva del pedido ya venció");
      }

      const payment = await dependencias.conPrismaTenant(contexto.tenantId, (prisma) =>
        prisma.payment.create({
          data: {
            tenantId: contexto.tenantId,
            pedidoId: pedido.id,
            proveedor: metodo,
            metodo,
            estado: "PENDIENTE",
            monto: pedido.total,
            moneda: pedido.moneda,
          },
        }),
      );

      await dependencias.conPrismaTenant(contexto.tenantId, (prisma) =>
        prisma.pedido.updateMany({
          where: { id: pedido.id, tenantId: contexto.tenantId, estado: "PENDIENTE" },
          data: { metodoPago: metodo },
        }),
      );

      const proveedor = dependencias.obtenerProveedor(metodo);
      const resultado = await proveedor.crearPago({
        paymentId: payment.id,
        pedidoId: pedido.id,
        tenantId: contexto.tenantId,
        reservaExpiraEn: pedido.reservaExpiraEn,
        baseUrl,
        monto: Number(pedido.total),
        moneda: pedido.moneda,
        nombreCliente: pedido.user?.name ?? null,
        emailCliente: pedido.user?.email ?? null,
        items: pedido.items.map((item) => ({
          nombre: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: Number(item.precioUnitario),
        })),
      });

      await dependencias.conPrismaTenant(contexto.tenantId, (prisma) =>
        prisma.payment.updateMany({
          where: { id: payment.id, pedidoId: pedido.id, tenantId: contexto.tenantId },
          data: { estado: resultado.estado },
        }),
      );

      return {
        ok: true,
        pedidoId: pedido.id,
        paymentId: payment.id,
        checkoutUrl: resultado.checkoutUrl,
        instrucciones: resultado.instrucciones,
        esSandbox: resultado.esSandbox,
      };
    } catch (error) {
      if (pedidoIdCreado && tenantIdProcesado) {
        try {
          const pedidoId = pedidoIdCreado;
          const tenantId = tenantIdProcesado;
          await dependencias.conPrismaTenant(tenantId, (prisma) => prisma.$transaction(async (tx) => {
            const cancelado = await tx.pedido.updateMany({
              where: { id: pedidoId, tenantId, estado: "PENDIENTE" },
              data: { estado: "CANCELADO", estadoPago: "CANCELADO" },
            });
            if (cancelado.count === 1) {
              await tx.payment.updateMany({
                where: { pedidoId, tenantId, estado: { not: "APROBADO" } },
                data: { estado: "CANCELADO" },
              });
              const liberada = await dependencias.liberarReservaStockPedido(
                pedidoId,
                tenantId,
                tx,
              );
              if (!liberada) throw new Error("No se pudo liberar la reserva del pedido");
            }
          }));
        } catch (errorLimpieza) {
          console.error("Error cancelando pedido cuyo pago no se inició:", errorLimpieza);
        }
      }
      dependencias.registrarError(
        "Error iniciando pago:",
        error instanceof Error ? error.message : String(error),
      );
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "No se pudo iniciar el pago. Intentá de nuevo.",
      };
    }
  };
}
