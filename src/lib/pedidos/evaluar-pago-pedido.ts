export type PedidoEstadoPagoNombre =
  | "PENDIENTE"
  | "APROBADO"
  | "RECHAZADO"
  | "CANCELADO"
  | "EN_ACREDITACION";

export type ResultadoEvaluacionPago =
  | { ok: true; yaConfirmado: true }
  | {
      ok: true;
      yaConfirmado: false;
      estado: "CONFIRMADO";
      estadoPago: "APROBADO";
    }
  | { ok: false; error: string };

export type DatosValidacionPago = {
  pedidoId: string;
  estado: string;
  estadoPago: string;
  total: number;
  montoPago: number;
  referencia: string;
};

/** Evalúa la validez de un pago de Mercado Pago sin escribir en la base de datos. */
export function evaluarPagoPedido(d: DatosValidacionPago): ResultadoEvaluacionPago {
  if (d.estadoPago !== "approved") {
    return { ok: false, error: "El pago no está acreditado todavía" };
  }

  if (d.referencia !== d.pedidoId) {
    return { ok: false, error: "El pago no corresponde a este pedido" };
  }

  if (d.montoPago < d.total) {
    return { ok: false, error: "El monto del pago no es válido" };
  }

  if (d.estado === "CONFIRMADO") {
    return { ok: true, yaConfirmado: true };
  }

  return {
    ok: true,
    yaConfirmado: false,
    estado: "CONFIRMADO",
    estadoPago: "APROBADO",
  };
}
