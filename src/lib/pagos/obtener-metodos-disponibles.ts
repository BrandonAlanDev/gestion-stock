import "server-only";

import { conPrismaTenant } from "@/lib/prisma";
import { METODOS_PAGO_CONOCIDOS } from "@/lib/pagos/constantes";
import { obtenerProveedor } from "@/lib/pagos/registro";
import { registrarErrorPagoSeguro } from "@/lib/pagos/registro-error-seguro";
import { obtenerEstadoTransferenciaDesdeConfig } from "@/lib/pagos/proveedores/transferencia/transferencia-proveedor";
import type { EstadoProveedor, MetodoPagoId } from "@/lib/pagos/tipos";

export type EstadoConfiguracionMetodoPago =
  | "DESACTIVADA"
  | "NO_REQUERIDA"
  | "COMPLETA"
  | "INCOMPLETA"
  | "ERROR_TEMPORAL";

export interface RegistroMetodoPago {
  metodo: string;
  activo: boolean;
  config?: unknown;
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
    registro?: RegistroMetodoPago,
  ): Promise<EstadoProveedor>;
  registrarErrorTemporal(
    metodo: MetodoPagoId,
    tenantId: string,
    error: unknown,
  ): void;
}

/**
 * Devuelve el estado de todos los métodos de pago conocidos para un comercio,
 * combinando la configuración persistida (MetodoPago) con el estado guardado
 * de la conexión. Los proveedores desactivados no se consultan y el checkout
 * solo consume los métodos activos y disponibles.
 */
export function crearObtenedorMetodosPagoDisponibles(
  dependencias: DependenciasObtenerMetodosPago,
): (
  tenantId: string,
  registrosExistentes?: ReadonlyArray<RegistroMetodoPago>,
  estadosPreviamenteConsultados?: Partial<Record<MetodoPagoId, EstadoProveedor>>,
) => Promise<ResumenMetodoPago[]> {
  return async function obtenerMetodosPagoDisponibles(
    tenantId,
    registrosExistentes,
    estadosPreviamenteConsultados = {},
  ): Promise<ResumenMetodoPago[]> {
    const registros = registrosExistentes ?? await dependencias.listarRegistros(tenantId);
    const porMetodo = new Map<string, RegistroMetodoPago>();
    for (const registro of registros) {
      porMetodo.set(registro.metodo, registro);
    }

    const resultados: ResumenMetodoPago[] = [];

    for (const definicion of METODOS_PAGO_CONOCIDOS) {
      const registro = porMetodo.get(definicion.id);
      const requiereVerificacion = definicion.requiereConexion || definicion.requiereConfiguracion;
      let estadoProveedor = estadosPreviamenteConsultados[definicion.id];

      // La transferencia se puede comprobar con la configuración ya leída; no
      // necesita una segunda consulta a la base del tenant.
      if (
        !estadoProveedor &&
        definicion.id === "transferencia" &&
        registro &&
        Object.prototype.hasOwnProperty.call(registro, "config")
      ) {
        estadoProveedor = obtenerEstadoTransferenciaDesdeConfig(registro.config);
      }

      let conectado = estadoProveedor?.conectado ?? false;
      let estadoConfiguracion: EstadoConfiguracionMetodoPago = !registro?.activo
        ? "DESACTIVADA"
        : requiereVerificacion
          ? "INCOMPLETA"
          : "NO_REQUERIDA";

      if (registro?.activo && requiereVerificacion && estadoProveedor) {
        estadoConfiguracion = conectado ? "COMPLETA" : "INCOMPLETA";
      } else if (registro?.activo && requiereVerificacion) {
        try {
          const estado = await dependencias.obtenerEstadoProveedor(tenantId, definicion.id, registro);
          conectado = estado.conectado;
          estadoConfiguracion = conectado ? "COMPLETA" : "INCOMPLETA";
        } catch (error) {
          conectado = false;
          estadoConfiguracion = "ERROR_TEMPORAL";
          dependencias.registrarErrorTemporal(definicion.id, tenantId, error);
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
    prisma.metodoPago.findMany({ where: {}, select: { metodo: true, activo: true, config: true } }),
  ),
  obtenerEstadoProveedor: (tenantId, metodo, registro) => {
    if (metodo === "transferencia" && registro && "config" in registro) {
      return Promise.resolve(obtenerEstadoTransferenciaDesdeConfig(registro.config));
    }
    return obtenerProveedor(metodo).obtenerEstado(tenantId);
  },
  registrarErrorTemporal: (metodo, _tenantId, error) =>
    registrarErrorPagoSeguro(
      "Fallo temporal consultando configuración de método de pago",
      error,
      metodo,
      "estado_proveedores",
    ),
});
