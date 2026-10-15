"use server";

import "server-only";
import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { obtenerMetodosPagoDisponibles } from "@/lib/pagos/obtener-metodos-disponibles";
import type { MetodoPagoId } from "@/lib/pagos/tipos";

export interface MetodoPagoAdmin {
  id: MetodoPagoId;
  nombre: string;
  descripcion: string;
  activo: boolean;
  requiereConexion: boolean;
  conectado: boolean;
  instrucciones: string | null;
}

export type ResultadoMetodosPago =
  | { ok: true; metodos: MetodoPagoAdmin[] }
  | { ok: false; error: string };

/**
 * Devuelve el estado administrativo de todos los métodos de pago del comercio,
 * incluyendo la conexión real y la configuración (instrucciones). No expone
 * credenciales.
 */
export async function obtenerMetodosPago(): Promise<ResultadoMetodosPago> {
  try {
    const contexto = await requiereAdmin();

    const [disponibles, registros] = await Promise.all([
      obtenerMetodosPagoDisponibles(contexto.tenantId),
      prisma.metodoPago.findMany({ where: { tenantId: contexto.tenantId } }),
    ]);
    const porMetodo = new Map<string, { config: unknown }>();
    for (const registro of registros) {
      porMetodo.set(registro.metodo, { config: registro.config });
    }

    const metodos: MetodoPagoAdmin[] = disponibles.map((metodo) => {
      const registro = porMetodo.get(metodo.id);
      const config = registro?.config as Record<string, unknown> | null;
      const instrucciones = config?.instrucciones;
      return {
        id: metodo.id,
        nombre: metodo.nombre,
        descripcion: metodo.descripcion,
        activo: metodo.activo,
        requiereConexion: metodo.requiereConexion,
        conectado: metodo.conectado,
        instrucciones:
          typeof instrucciones === "string" && instrucciones.trim()
            ? instrucciones.trim()
            : null,
      };
    });

    return { ok: true, metodos };
  } catch (error) {
    console.error(
      "Error obteniendo métodos de pago:",
      error instanceof Error ? error.message : String(error),
    );
    return { ok: false, error: "No se pudieron cargar los métodos de pago" };
  }
}
