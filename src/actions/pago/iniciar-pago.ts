"use server";

import "server-only";
import { prisma } from "@/lib/prisma";
import { obtenerContextoTenant } from "@/lib/tenants/obtener-contexto-tenant";
import { obtenerHostnameSolicitud } from "@/lib/tenants/obtener-hostname-solicitud";
import { crearPedidoDesdeCarrito } from "@/lib/pedidos/crear-pedido";
import { obtenerProveedor } from "@/lib/pagos/registro";
import { obtenerMetodosPagoDisponibles } from "@/lib/pagos/obtener-metodos-disponibles";
import { filtrarMetodosDisponibles } from "@/lib/pagos/filtrar-metodos-disponibles";
import type { MetodoPagoId } from "@/lib/pagos/tipos";

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

async function obtenerBaseUrl(): Promise<string> {
  const configurada = process.env.NEXT_PUBLIC_APP_URL;
  if (configurada) return configurada.replace(/\/$/, "");
  const host = await obtenerHostnameSolicitud();
  if (!host) throw new Error("No se pudo determinar la URL base de la tienda");
  return `https://${host}`;
}

/**
 * Inicia el pago de un pedido con el método seleccionado. Valida el método, crea
 * el pedido (recalculando precios y validando stock), registra el Payment en
 * estado PENDIENTE y delega la creación de la operación en el proveedor.
 */
export async function iniciarPago(
  metodo: MetodoPagoId,
  items: Array<{
    productId: string | number;
    variantId: string | number;
    cantidad: number;
  }>,
): Promise<ResultadoIniciarPago> {
  try {
    const contexto = await obtenerContextoTenant();
    if (!contexto?.usuarioId) {
      return { ok: false, error: "Debés iniciar sesión para confirmar el pago" };
    }

    const disponibles = filtrarMetodosDisponibles(
      await obtenerMetodosPagoDisponibles(contexto.tenantId),
    );
    const seleccionado = disponibles.find((metodoDisponible) => metodoDisponible.id === metodo);
    if (!seleccionado) {
      return { ok: false, error: "El método de pago no está disponible" };
    }

    const baseUrl = await obtenerBaseUrl();

    const creado = await crearPedidoDesdeCarrito(
      contexto.tenantId,
      contexto.usuarioId,
      items,
    );

    const pedido = await prisma.pedido.findUnique({
      where: { id: creado.pedidoId },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { nombre: true, cantidad: true, precioUnitario: true } },
      },
    });
    if (!pedido) {
      return { ok: false, error: "No se pudo crear el pedido" };
    }

    const payment = await prisma.payment.create({
      data: {
        tenantId: contexto.tenantId,
        pedidoId: pedido.id,
        proveedor: metodo,
        metodo,
        estado: "PENDIENTE",
        monto: pedido.total,
        moneda: pedido.moneda,
      },
    });

    await prisma.pedido.update({
      where: { id: pedido.id },
      data: { metodoPago: metodo },
    });

    const proveedor = obtenerProveedor(metodo);
    const resultado = await proveedor.crearPago({
      paymentId: payment.id,
      pedidoId: pedido.id,
      tenantId: contexto.tenantId,
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

    if (resultado.externalId) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { externalId: resultado.externalId, estado: resultado.estado },
      });
    }

    return {
      ok: true,
      pedidoId: pedido.id,
      paymentId: payment.id,
      checkoutUrl: resultado.checkoutUrl,
      instrucciones: resultado.instrucciones,
      esSandbox: resultado.esSandbox,
    };
  } catch (error) {
    console.error(
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
}
