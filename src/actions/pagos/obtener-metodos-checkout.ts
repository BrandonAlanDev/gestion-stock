"use server";

import "server-only";
import { obtenerContextoTenant } from "@/lib/tenants/obtener-contexto-tenant";
import { obtenerMetodosPagoDisponibles } from "@/lib/pagos/obtener-metodos-disponibles";
import { filtrarMetodosDisponibles } from "@/lib/pagos/filtrar-metodos-disponibles";
import { registrarErrorPagoSeguro } from "@/lib/pagos/registro-error-seguro";

export type ResultadoMetodosCheckout =
  | {
      ok: true;
      metodos: Array<{ id: string; nombre: string; descripcion: string }>;
      aviso?: string;
    }
  | { ok: false; error: string };

/**
 * Devuelve los métodos de pago disponibles para el checkout del comercio actual.
 * Solo expone los que están activos y completos, sin detalles de proveedores.
 */
export async function obtenerMetodosCheckout(): Promise<ResultadoMetodosCheckout> {
  try {
    const contexto = await obtenerContextoTenant();
    if (!contexto) return { ok: false, error: "Tienda no disponible" };

    const resumen = await obtenerMetodosPagoDisponibles(contexto.tenantId);
    const disponibles = filtrarMetodosDisponibles(resumen);
    const consultaMetodoFallida = resumen.some(
      (metodo) => metodo.activo && metodo.estadoConfiguracion === "ERROR_TEMPORAL",
    );

    // El filtro excluye los métodos que no pudieron verificarse; el aviso no expone la configuración.
    const aviso = consultaMetodoFallida
      ? "No pudimos verificar temporalmente una opción de pago. Podés usar las opciones visibles o intentar nuevamente en unos minutos."
      : undefined;

    return {
      ok: true,
      metodos: disponibles.map((metodo) => ({
        id: metodo.id,
        nombre: metodo.nombre,
        descripcion: metodo.descripcion,
      })),
      ...(aviso ? { aviso } : {}),
    };
  } catch (error) {
    registrarErrorPagoSeguro("Error obteniendo métodos de pago para checkout", error, undefined, "lectura_tenant");
    return { ok: false, error: "No se pudieron cargar los métodos de pago" };
  }
}
