import type { MetodoPagoId } from "../pagos/tipos";

export const DURACION_RESERVA_MERCADOPAGO_MS = 30 * 60 * 1000;
export const DURACION_RESERVA_MANUAL_HORAS_PREDETERMINADA = 48;
export const DURACION_RESERVA_MANUAL_HORAS_MINIMA = 1;
export const DURACION_RESERVA_MANUAL_HORAS_MAXIMA = 720;

export interface PoliticaVencimientoReserva {
  habilitado: boolean;
  horas: number;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/**
 * Las configuraciones anteriores no declaran vencimiento: se mantienen sin
 * fecha límite y muestran 48 horas como valor sugerido para una adopción
 * explícita desde administración.
 */
export function leerPoliticaVencimientoReserva(
  configuracion: unknown,
): PoliticaVencimientoReserva {
  if (!esObjeto(configuracion) || !esObjeto(configuracion.vencimiento)) {
    return {
      habilitado: false,
      horas: DURACION_RESERVA_MANUAL_HORAS_PREDETERMINADA,
    };
  }

  const vencimiento = configuracion.vencimiento;
  const horas = vencimiento.horas;
  const horasValidas = Number.isInteger(horas) &&
    Number(horas) >= DURACION_RESERVA_MANUAL_HORAS_MINIMA &&
    Number(horas) <= DURACION_RESERVA_MANUAL_HORAS_MAXIMA;

  return {
    habilitado: vencimiento.habilitado === true && horasValidas,
    horas: horasValidas ? Number(horas) : DURACION_RESERVA_MANUAL_HORAS_PREDETERMINADA,
  };
}

/** Mantiene la vigencia de Mercado Pago y aplica políticas explícitas a pagos manuales. */
export function obtenerVencimientoReserva(
  metodoPago: MetodoPagoId,
  iniciadaEn: Date,
  configuracion?: unknown,
): Date | null {
  if (metodoPago === "mercadopago") {
    return new Date(iniciadaEn.getTime() + DURACION_RESERVA_MERCADOPAGO_MS);
  }

  const vencimiento = esObjeto(configuracion) && esObjeto(configuracion.vencimiento)
    ? configuracion.vencimiento
    : null;
  if (vencimiento?.habilitado === true) {
    const horas = vencimiento.horas;
    if (!Number.isInteger(horas) ||
      Number(horas) < DURACION_RESERVA_MANUAL_HORAS_MINIMA ||
      Number(horas) > DURACION_RESERVA_MANUAL_HORAS_MAXIMA) {
      throw new Error("La configuración de vencimiento del método de pago no es válida");
    }
  }

  const politica = leerPoliticaVencimientoReserva(configuracion);
  if (!politica.habilitado) return null;
  return new Date(iniciadaEn.getTime() + politica.horas * 60 * 60 * 1000);
}
