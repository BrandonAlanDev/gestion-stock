import type { MetodoPagoId } from "./tipos";

export interface DetalleErrorSeguro {
  tipo: string;
  codigo?: string;
  fase?: FaseErrorPago;
}

export type FaseErrorPago =
  | "autenticacion"
  | "lectura_tenant"
  | "estado_proveedores"
  | "preparacion_respuesta";

/** Extrae metadatos técnicos sin incluir mensajes que puedan contener secretos. */
export function obtenerDetalleErrorSeguro(error: unknown): DetalleErrorSeguro {
  const nombre = error instanceof Error ? error.name : "ErrorDesconocido";
  const tipo = /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(nombre) ? nombre : "Error";
  const objeto = typeof error === "object" && error !== null
    ? error as Record<string, unknown>
    : null;
  const codigo = objeto?.code;

  if (typeof codigo === "string" && /^(?:P\d{4}|ER_[A-Z0-9_]{1,48}|E[A-Z0-9_]{1,48})$/.test(codigo)) {
    return { tipo, codigo };
  }
  return { tipo };
}

export function registrarErrorPagoSeguro(
  contexto: string,
  error: unknown,
  metodo?: MetodoPagoId,
  fase?: FaseErrorPago,
): void {
  const detalle = { ...obtenerDetalleErrorSeguro(error), ...(fase ? { fase } : {}) };
  console.error(contexto, metodo ? { metodo, ...detalle } : detalle);
}
