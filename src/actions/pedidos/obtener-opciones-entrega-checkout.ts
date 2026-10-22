"use server";

import "server-only";
import { obtenerContextoTenant } from "@/lib/tenants/obtener-contexto-tenant";
import { obtenerOpcionesEntregaTienda } from "@/lib/pedidos/obtener-opciones-entrega-tienda";

/** Devuelve las modalidades disponibles para el tenant de la solicitud actual. */
export async function obtenerOpcionesEntregaCheckout() {
  try {
    const contexto = await obtenerContextoTenant();
    if (!contexto) return { ok: false as const, error: "Tienda no disponible" };

    return {
      ok: true as const,
      opciones: await obtenerOpcionesEntregaTienda(contexto.tenantId),
    };
  } catch (error) {
    console.error(
      "Error obteniendo modalidades de entrega:",
      error instanceof Error ? error.message : String(error),
    );
    return {
      ok: false as const,
      error: "No se pudieron validar las modalidades de entrega.",
    };
  }
}
