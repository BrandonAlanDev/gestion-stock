import type { MetodoPagoId } from "@/lib/pagos/tipos";
import type { ResumenMetodoPago } from "@/lib/pagos/obtener-metodos-disponibles";

export interface MetodoPagoCheckout {
  id: MetodoPagoId;
  nombre: string;
  descripcion: string;
}

/** Filtra los métodos que están activos y disponibles para el checkout. */
export function filtrarMetodosDisponibles(
  metodos: ResumenMetodoPago[],
): MetodoPagoCheckout[] {
  return metodos
    .filter((metodo) => metodo.activo && (!metodo.requiereConexion || metodo.conectado))
    .map((metodo) => ({
      id: metodo.id,
      nombre: metodo.nombre,
      descripcion: metodo.descripcion,
    }));
}
