"use server";

import "server-only";
import { headers } from "next/headers";
import { conPrisma } from "@/lib/prisma";
import { obtenerContextoTenant } from "@/lib/tenants/obtener-contexto-tenant";
import { obtenerHostnameSolicitud } from "@/lib/tenants/obtener-hostname-solicitud";
import { construirOrigenSolicitud } from "@/lib/tenants/construir-origen-solicitud";
import { crearPedidoDesdeCarrito } from "@/lib/pedidos/crear-pedido";
import { liberarReservaStockPedido } from "@/lib/pedidos/gestionar-reserva-stock";
import { obtenerProveedor } from "@/lib/pagos/registro";
import { obtenerMetodosPagoDisponibles } from "@/lib/pagos/obtener-metodos-disponibles";
import { filtrarMetodosDisponibles } from "@/lib/pagos/filtrar-metodos-disponibles";
import { crearAccionIniciarPago } from "@/lib/actions/pago/crear-accion-iniciar-pago";
import type { MetodoPagoId } from "@/lib/pagos/tipos";

export type { ResultadoIniciarPago } from "@/lib/actions/pago/crear-accion-iniciar-pago";

async function obtenerBaseUrl(): Promise<string> {
  const host = await obtenerHostnameSolicitud();
  if (!host) throw new Error("No se pudo determinar la URL base de la tienda");
  const cabeceras = await headers();
  const hostRecibido = cabeceras.get("host") ?? "";
  const origen = construirOrigenSolicitud(
    hostRecibido,
    process.env.NODE_ENV === "production",
  );
  if (!origen || new URL(origen).hostname.replace(/^\[|\]$/g, "") !== host) {
    throw new Error("Host de la tienda inválido");
  }
  return origen;
}

const ejecutarIniciarPago = crearAccionIniciarPago({
  obtenerContextoTenant,
  obtenerMetodosPagoDisponibles,
  filtrarMetodosDisponibles,
  obtenerBaseUrl,
  crearPedidoDesdeCarrito,
  conPrisma,
  liberarReservaStockPedido,
  obtenerProveedor,
  registrarError: (mensaje, detalle) => console.error(mensaje, detalle),
});

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
) {
  return ejecutarIniciarPago(metodo, items);
}
