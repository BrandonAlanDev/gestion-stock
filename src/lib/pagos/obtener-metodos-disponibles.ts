import "server-only";

import { conPrismaTenant } from "@/lib/prisma";
import { METODOS_PAGO_CONOCIDOS } from "@/lib/pagos/constantes";
import { obtenerProveedor } from "@/lib/pagos/registro";
import { registrarErrorPagoSeguro } from "@/lib/pagos/registro-error-seguro";
import type { EstadoProveedor, MetodoPagoId } from "@/lib/pagos/tipos";

export type EstadoConfiguracionMetodoPago =
  | "NO_REQUERIDA"
  | "COMPLETA"
  | "INCOMPLETA"
  | "ERROR_TEMPORAL";

export interface RegistroMetodoPago {
  metodo: string;
  activo: boolean;
}

export interface ResumenMetodoPago {
  id: MetodoPagoId;
  nombre: string;
  descripcion: string;
  activo: boolean;
  requiereConexion: boolean;
  requiereConfiguracion: boolean;
  conectado: boolean;
  estadoConfiguracion: EstadoConfiguracionMetodoPago;
}

interface DependenciasObtenerMetodosPago {
  listarRegistros(tenantId: string): Promise<ReadonlyArray<RegistroMetodoPago>>;
  obtenerEstadoProveedor(
    tenantId: string,
    metodo: MetodoPagoId,
  ): Promise<EstadoProveedor>;
  registrarErrorTemporal(
    metodo: MetodoPagoId,
    tenantId: string,
    error: unknown,
  ): void;
}

/**
 * Devuelve el estado de todos los métodos de pago conocidos para un comercio,
 * combinando la configuración persistida (MetodoPago) con el estado de conexión
 * real de cada proveedor. El checkout solo consume los que estén activos y
 * disponibles, sin saber cómo funciona cada proveedor.
 */
export function crearObtenedorMetodosPagoDisponibles(
  dependencias: DependenciasObtenerMetodosPago,
): (
  tenantId: string,
  registrosExistentes?: ReadonlyArray<RegistroMetodoPago>,
) => Promise<ResumenMetodoPago[]> {
  return async function obtenerMetodosPagoDisponibles(
    tenantId,
    registrosExistentes,
  ): Promise<ResumenMetodoPago[]> {
    const registros = registrosExistentes ?? await dependencias.listarRegistros(tenantId);
    const porMetodo = new Map<string, { activo: boolean }>();
    for (const registro of registros) {
      porMetodo.set(registro.metodo, { activo: registro.activo });
    }

    const resultados: ResumenMetodoPago[] = [];

    for (const definicion of METODOS_PAGO_CONOCIDOS) {
      const registro = porMetodo.get(definicion.id);
      const requiereVerificacion = definicion.requiereConexion || definicion.requiereConfiguracion;
      let conectado = false;
      let estadoConfiguracion: EstadoConfiguracionMetodoPago = requiereVerificacion
        ? "INCOMPLETA"
        : "NO_REQUERIDA";

      if (requiereVerificacion) {
        try {
          const estado = await dependencias.obtenerEstadoProveedor(tenantId, definicion.id);
          conectado = estado.conectado;
          estadoConfiguracion = conectado ? "COMPLETA" : "INCOMPLETA";
        } catch (error) {
          // Solo se mejora la clasificación de transferencia en esta etapa.
          // Mercado Pago conserva su comportamiento existente.
          if (definicion.id === "transferencia") {
            estadoConfiguracion = "ERROR_TEMPORAL";
            dependencias.registrarErrorTemporal(definicion.id, tenantId, error);
          }
        }
      }

      resultados.push({
        id: definicion.id,
        nombre: definicion.nombre,
        descripcion: definicion.descripcion,
        activo: registro?.activo ?? false,
        requiereConexion: definicion.requiereConexion,
        requiereConfiguracion: definicion.requiereConfiguracion,
        conectado,
        estadoConfiguracion,
      });
    }

    return resultados;
  };
}

export const obtenerMetodosPagoDisponibles = crearObtenedorMetodosPagoDisponibles({
  listarRegistros: (tenantId) => conPrismaTenant(tenantId, (prisma) =>
    prisma.metodoPago.findMany({ where: {}, select: { metodo: true, activo: true } }),
  ),
  obtenerEstadoProveedor: (tenantId, metodo) =>
    obtenerProveedor(metodo).obtenerEstado(tenantId),
  registrarErrorTemporal: (metodo, _tenantId, error) =>
    registrarErrorPagoSeguro(
      "Fallo temporal consultando configuración de método de pago",
      error,
      metodo,
    ),
});
