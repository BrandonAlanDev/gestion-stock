import type { Prisma } from "@/../generated/prisma/client";
import { DURACION_RESERVA_MANUAL_HORAS_PREDETERMINADA } from "@/lib/pedidos/politica-reserva-stock";

export interface ActualizacionConfigMetodoPago {
  instrucciones?: string | null;
  vencimiento?: { habilitado: boolean; horas: number };
}

/** La nueva configuración manual comienza con el vencimiento comercial sugerido. */
export function crearConfigInicialMetodoPago(
  metodo: "efectivo" | "transferencia" | "mercadopago",
): Prisma.InputJsonObject | undefined {
  if (metodo === "mercadopago") return undefined;
  return {
    vencimiento: {
      habilitado: true,
      horas: DURACION_RESERVA_MANUAL_HORAS_PREDETERMINADA,
    },
  };
}

function esObjetoJson(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/** Actualiza solo las claves pedidas y conserva todas las demás del JSON. */
export function combinarConfigMetodoPago(
  configuracionActual: unknown,
  actualizacion: ActualizacionConfigMetodoPago,
): Prisma.InputJsonObject {
  if (configuracionActual !== null && configuracionActual !== undefined &&
    !esObjetoJson(configuracionActual)) {
    throw new Error("La configuración existente del método no tiene un formato compatible");
  }

  const config = { ...(esObjetoJson(configuracionActual) ? configuracionActual : {}) };
  if (actualizacion.instrucciones !== undefined) {
    config.instrucciones = actualizacion.instrucciones;
  }
  if (actualizacion.vencimiento !== undefined) {
    config.vencimiento = actualizacion.vencimiento;
  }
  return config as Prisma.InputJsonObject;
}

