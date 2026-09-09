"use server";

import "server-only";
import { obtenerContextoTenant } from "@/lib/tenants/obtener-contexto-tenant";
import { obtenerHostnameSolicitud } from "@/lib/tenants/obtener-hostname-solicitud";
import { crearPedidoDesdeCarrito } from "@/lib/pedidos/crear-pedido";
import { crearPreferenciaPago } from "@/lib/mercadopago/crear-preferencia-pago";

async function obtenerBaseUrl(): Promise<string> {
  const configurada = process.env.NEXT_PUBLIC_APP_URL;
  if (configurada) return configurada.replace(/\/$/, "");
  const host = await obtenerHostnameSolicitud();
  if (!host) throw new Error("No se pudo determinar la URL base de la tienda");
  return `https://${host}`;
}

export type ResultadoCrearPedidoPago =
  | { ok: true; pedidoId: string; checkoutUrl: string; esSandbox: boolean }
  | { ok: false; error: string };

/**
 * Crea el pedido desde el carrito y devuelve la URL del checkout de Mercado Pago.
 * El comprador debe estar logueado; la sesión vincula el pedido al usuario y al comercio.
 */
export async function crearPedidoPago(items: Array<{
  productId: string | number;
  variantId: string | number;
  cantidad: number;
}>): Promise<ResultadoCrearPedidoPago> {
  try {
    const contexto = await obtenerContextoTenant();
    if (!contexto?.usuarioId) {
      return { ok: false, error: "Debés iniciar sesión para confirmar el pago" };
    }

    const baseUrl = await obtenerBaseUrl();

    const { pedidoId } = await crearPedidoDesdeCarrito(
      contexto.tenantId,
      contexto.usuarioId,
      items,
    );

    const { checkoutUrl, esSandbox } = await crearPreferenciaPago(
      pedidoId,
      contexto.tenantId,
      baseUrl,
    );

    return { ok: true, pedidoId, checkoutUrl, esSandbox };
  } catch (error) {
    console.error(
      "Error creando pedido/pago:",
      error instanceof Error ? error.message : String(error),
    );
    return { ok: false, error: error instanceof Error ? error.message : "No se pudo iniciar el pago" };
  }
}
