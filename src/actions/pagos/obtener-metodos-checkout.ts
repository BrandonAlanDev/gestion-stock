"use server";

import "server-only";
import { obtenerContextoTenant } from "@/lib/tenants/obtener-contexto-tenant";
import { obtenerMetodosPagoDisponibles } from "@/lib/pagos/obtener-metodos-disponibles";
import { filtrarMetodosDisponibles } from "@/lib/pagos/filtrar-metodos-disponibles";

export type ResultadoMetodosCheckout =
  | { ok: true; metodos: Array<{ id: string; nombre: string; descripcion: string }> }
  | { ok: false; error: string };

/**
 * Devuelve los métodos de pago disponibles para el checkout del comercio actual.
 * Solo expone los que están activos y completos, sin detalles de proveedores.
 */
export async function obtenerMetodosCheckout(): Promise<ResultadoMetodosCheckout> {
  try {
    const contexto = await obtenerContextoTenant();
    if (!contexto) return { ok: false, error: "Tienda no disponible" };

    const disponibles = filtrarMetodosDisponibles(
      await obtenerMetodosPagoDisponibles(contexto.tenantId),
    );

    return {
      ok: true,
      metodos: disponibles.map((metodo) => ({
        id: metodo.id,
        nombre: metodo.nombre,
        descripcion: metodo.descripcion,
      })),
    };
  } catch (error) {
    console.error(
      "Error obteniendo métodos de pago:",
      error instanceof Error ? error.message : String(error),
    );
    return { ok: false, error: "No se pudieron cargar los métodos de pago" };
  }
}
