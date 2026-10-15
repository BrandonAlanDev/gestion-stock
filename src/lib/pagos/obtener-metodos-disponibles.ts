import "server-only";

import { prisma } from "@/lib/prisma";
import { METODOS_PAGO_CONOCIDOS } from "@/lib/pagos/constantes";
import { obtenerProveedor } from "@/lib/pagos/registro";
import type { MetodoPagoId } from "@/lib/pagos/tipos";

export interface ResumenMetodoPago {
  id: MetodoPagoId;
  nombre: string;
  descripcion: string;
  activo: boolean;
  requiereConexion: boolean;
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
): Promise<ResumenMetodoPago[]> {
  const registros = await prisma.metodoPago.findMany({ where: { tenantId } });
  const porMetodo = new Map<string, { activo: boolean }>();
  for (const registro of registros) {
    porMetodo.set(registro.metodo, { activo: registro.activo });
  }

  const resultados: ResumenMetodoPago[] = [];

  for (const definicion of METODOS_PAGO_CONOCIDOS) {
    const registro = porMetodo.get(definicion.id);

    let conectado = false;
    if (definicion.requiereConexion) {
      try {
        const proveedor = obtenerProveedor(definicion.id);
        const estado = await proveedor.obtenerEstado(tenantId);
        conectado = estado.conectado;
      } catch {
        conectado = false;
      }
    }

    let activo = registro?.activo ?? false;
    // Regla por defecto: si aún no se configuró, Mercado Pago se considera activo
    // cuando hay una cuenta conectada (experiencia esperada al conectar por OAuth).
    if (!registro && definicion.requiereConexion) {
      activo = conectado;
    }

    resultados.push({
      id: definicion.id,
      nombre: definicion.nombre,
      descripcion: definicion.descripcion,
      activo,
      requiereConexion: definicion.requiereConexion,
      conectado,
    });
  }

  return resultados;
}
