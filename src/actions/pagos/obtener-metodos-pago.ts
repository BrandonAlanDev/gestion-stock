"use server";

import "server-only";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { obtenerMetodosPagoDisponibles } from "@/lib/pagos/obtener-metodos-disponibles";
import type { EstadoConfiguracionMetodoPago } from "@/lib/pagos/obtener-metodos-disponibles";
import { registrarErrorPagoSeguro } from "@/lib/pagos/registro-error-seguro";
import type { MetodoPagoId } from "@/lib/pagos/tipos";
import { conPrismaTenant } from "@/lib/prisma";
import { leerPoliticaVencimientoReserva } from "@/lib/pedidos/politica-reserva-stock";

export interface MetodoPagoAdmin {
  id: MetodoPagoId;
  nombre: string;
  descripcion: string;
  activo: boolean;
  requiereConexion: boolean;
  conectado: boolean;
  estadoConfiguracion: EstadoConfiguracionMetodoPago;
  instrucciones: string | null;
  vencimiento: { habilitado: boolean; horas: number };
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

    const registros = await conPrismaTenant(contexto.tenantId, (prisma) =>
      prisma.metodoPago.findMany({ where: {} }),
    );
    const disponibles = await obtenerMetodosPagoDisponibles(contexto.tenantId, registros);
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
        estadoConfiguracion: metodo.estadoConfiguracion,
        instrucciones:
          typeof instrucciones === "string" && instrucciones.trim()
            ? instrucciones.trim()
            : null,
        vencimiento: leerPoliticaVencimientoReserva(registro?.config),
      };
    });

    return { ok: true, metodos };
  } catch (error) {
    registrarErrorPagoSeguro("Error obteniendo métodos de pago", error);
    return { ok: false, error: "No se pudieron cargar los métodos de pago" };
  }
}
