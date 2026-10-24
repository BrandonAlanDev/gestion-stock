import type { PrismaClient } from "@/../generated/prisma/client";
import type { ItemParaCrearPedido } from "@/lib/pedidos/crear-pedido";
import type { ResumenMetodoPago } from "@/lib/pagos/obtener-metodos-disponibles";
import { ErrorItemCarrito } from "@/lib/pedidos/resolver-items-carrito";
import type { MetodoPagoId, PaymentProvider } from "@/lib/pagos/tipos";
import { esMetodoPagoCompatibleConEntrega } from "@/lib/pagos/es-metodo-pago-compatible-entrega";
import type { DatosEntrega } from "@/lib/pedidos/datos-entrega";
import type { ResultadoCrearPedido } from "@/lib/pedidos/crear-pedido";
import type { ResumenCheckout } from "@/lib/pedidos/tipos-resumen-checkout";
import {
  estaDisponibleMetodoEntrega,
  type OpcionesEntregaCheckout,
} from "@/lib/pedidos/opciones-entrega";
import { liberarReservaStockPedido } from "@/lib/pedidos/gestionar-reserva-stock";

export type ResultadoIniciarPago =
  | {
      ok: true;
      pedidoId: string;
      numero?: number;
      paymentId: string;
      checkoutUrl: string | null;
      instrucciones: string | null;
      reservaExpiraEn: string | null;
      esSandbox: boolean;
    }
  | {
      ok: false;
      error: string;
      codigo?:
        | "SIN_MODALIDADES_ENTREGA"
        | "MODALIDAD_ENTREGA_NO_DISPONIBLE"
        | "PRECIOS_CAMBIARON"
        | "PRODUCTO_NO_DISPONIBLE"
        | "STOCK_INSUFICIENTE";
      resumen?: ResumenCheckout;
    };

export interface DependenciasIniciarPago {
  obtenerContextoTenant: () => Promise<{
    tenantId: string;
    usuarioId?: string | null;
  } | null>;
  obtenerMetodosPagoDisponibles: (tenantId: string) => Promise<ResumenMetodoPago[]>;
  obtenerOpcionesEntrega: (tenantId: string) => Promise<OpcionesEntregaCheckout>;
  filtrarMetodosDisponibles: (
    metodos: ResumenMetodoPago[],
  ) => Array<Pick<ResumenMetodoPago, "id">>;
  obtenerBaseUrl: () => Promise<string>;
  crearPedidoDesdeCarrito: (
    tenantId: string,
    userId: string,
    items: ItemParaCrearPedido[],
    metodoPago: MetodoPagoId,
    datosEntrega: DatosEntrega | undefined,
    subtotalMostrado: number,
  ) => Promise<ResultadoCrearPedido>;
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
    datosEntrega: DatosEntrega | undefined,
    subtotalMostrado: number,
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

      const metodoEntrega = datosEntrega?.metodoEntrega;
      if (!metodoEntrega) {
        return { ok: false, error: "Seleccioná una modalidad de entrega." };
      }

      const opcionesEntrega = await dependencias.obtenerOpcionesEntrega(
        contexto.tenantId,
      );
      if (
        !opcionesEntrega.domicilioDisponible &&
        !opcionesEntrega.retiroTiendaDisponible
      ) {
        return {
          ok: false,
          codigo: "SIN_MODALIDADES_ENTREGA",
          error: "La tienda no tiene modalidades de entrega disponibles.",
        };
      }
      if (!estaDisponibleMetodoEntrega(opcionesEntrega, metodoEntrega)) {
        return {
          ok: false,
          codigo: "MODALIDAD_ENTREGA_NO_DISPONIBLE",
          error: "La modalidad de entrega seleccionada ya no está disponible.",
        };
      }
      if (!esMetodoPagoCompatibleConEntrega(metodo, metodoEntrega)) {
        return {
          ok: false,
          error: "El efectivo solo está disponible para retiro en tienda.",
        };
      }

      const baseUrl = await dependencias.obtenerBaseUrl();
      const creado = await dependencias.crearPedidoDesdeCarrito(
        contexto.tenantId,
        contexto.usuarioId,
        items,
        metodo,
        datosEntrega,
        subtotalMostrado,
      );
      if (!creado.ok) {
        return {
          ok: false,
          codigo: creado.codigo,
          error: creado.error,
          resumen: creado.resumen,
        };
      }
      pedidoIdCreado = creado.pedidoId;

      const pedido = await dependencias.conPrismaTenant(contexto.tenantId, (prisma) =>
        prisma.pedido.findFirst({
          where: { id: creado.pedidoId },
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
            pedidoId: pedido.id,
            proveedor: metodo,
            metodo,
            estado: "PENDIENTE",
            monto: pedido.total,
            moneda: pedido.moneda,
          },
        }),
      );

      const proveedor = dependencias.obtenerProveedor(metodo);
      const resultado = await proveedor.crearPago({
        tenantId: contexto.tenantId,
        paymentId: payment.id,
        pedidoId: pedido.id,
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
          where: { id: payment.id, pedidoId: pedido.id },
          data: {
            estado: resultado.estado,
            ...(metodo === "transferencia" && resultado.instrucciones
              ? { metadata: { instrucciones: resultado.instrucciones } }
              : {}),
          },
        }),
      );

      return {
        ok: true,
        pedidoId: pedido.id,
        numero: creado.numero,
        paymentId: payment.id,
        checkoutUrl: resultado.checkoutUrl,
        instrucciones: resultado.instrucciones,
        reservaExpiraEn: pedido.reservaExpiraEn?.toISOString() ?? null,
        esSandbox: resultado.esSandbox,
      };
    } catch (error) {
      if (pedidoIdCreado && tenantIdProcesado) {
        try {
          const pedidoId = pedidoIdCreado;
          await dependencias.conPrismaTenant(tenantIdProcesado, (prisma) => prisma.$transaction(async (tx) => {
            const cancelado = await tx.pedido.updateMany({
              where: { id: pedidoId, estado: "PENDIENTE" },
              data: { estado: "CANCELADO", estadoPago: "CANCELADO" },
            });
            if (cancelado.count === 1) {
              await tx.payment.updateMany({
                where: { pedidoId, estado: { not: "APROBADO" } },
                data: { estado: "CANCELADO" },
              });
              const liberada = await dependencias.liberarReservaStockPedido(
                pedidoId,
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
      if (error instanceof ErrorItemCarrito) {
        return {
          ok: false,
          codigo: error.codigo,
          error: error.message,
        };
      }
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
