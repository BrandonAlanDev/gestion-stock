import "server-only";

import { conPrismaTenant } from "@/lib/prisma";
import { METODOS_PAGO_CONOCIDOS } from "@/lib/pagos/constantes";
import { obtenerProveedor } from "@/lib/pagos/registro";
import type { MetodoPagoId } from "@/lib/pagos/tipos";

export interface ResumenMetodoPago {
  id: MetodoPagoId;
  nombre: string;
  descripcion: string;
  activo: boolean;
  requiereConexion: boolean;
  requiereConfiguracion: boolean;
  conectado: boolean;
}

/**
 * Devuelve el estado de todos los métodos de pago conocidos para un comercio,
 * combinando la configuración persistida (MetodoPago) con el estado de conexión
 * real de cada proveedor. El checkout solo consume los que estén activos y
 * disponibles, sin saber cómo funciona cada proveedor.
 */
export async function obtenerMetodosPagoDisponibles(
  tenantId: string,
  registrosExistentes?: ReadonlyArray<{ metodo: string; activo: boolean }>,
): Promise<ResumenMetodoPago[]> {
  const registros = registrosExistentes ?? await conPrismaTenant(tenantId, (prisma) =>
    prisma.metodoPago.findMany({ where: {} }),
  );
  const porMetodo = new Map<string, { activo: boolean }>();
  for (const registro of registros) {
    porMetodo.set(registro.metodo, { activo: registro.activo });
  }

  const resultados: ResumenMetodoPago[] = [];

  for (const definicion of METODOS_PAGO_CONOCIDOS) {
    const registro = porMetodo.get(definicion.id);

    let conectado = false;
    if (definicion.requiereConexion || definicion.requiereConfiguracion) {
      try {
        const proveedor = obtenerProveedor(definicion.id);
        const estado = await proveedor.obtenerEstado(tenantId);
        conectado = estado.conectado;
      } catch {
        conectado = false;
      }
    }

    const activo = registro?.activo ?? false;
    resultados.push({
      id: definicion.id,
      nombre: definicion.nombre,
      descripcion: definicion.descripcion,
      activo,
      requiereConexion: definicion.requiereConexion,
      requiereConfiguracion: definicion.requiereConfiguracion,
      conectado,
    });
  }

  return resultados;
}
