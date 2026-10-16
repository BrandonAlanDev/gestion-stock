import type { MetodoPagoId } from "../pagos/tipos";

export const DURACION_RESERVA_MERCADOPAGO_MS = 30 * 60 * 1000;

/** Mantiene la vigencia actual de Mercado Pago y no agrega vencimiento a transferencias. */
export function obtenerVencimientoReserva(
  metodoPago: MetodoPagoId,
  iniciadaEn: Date,
): Date | null {
  if (metodoPago !== "mercadopago") return null;
  return new Date(iniciadaEn.getTime() + DURACION_RESERVA_MERCADOPAGO_MS);
}
