import {
  leerEstadoOAuth,
  validarOrigenOAuth,
  verificarEstadoOAuth,
  type EstadoOAuthVerificado,
} from "./seguridad-oauth";
import { RUTA_CALLBACK_MERCADO_PAGO } from "../constantes";

const MAX_LONGITUD_CODIGO = 2048;
const PATRON_VERIFICADOR_PKCE = /^[A-Za-z0-9_-]{43,128}$/;

export interface EntradaCallbackOAuth {
  estado: string;
  estadoCookie: string | undefined;
  codeVerifier: string | undefined;
  hostRecibido: string;
  codigo: string | null;
  errorProveedor: string | null;
}

export type ResultadoCallbackOAuth =
  | { tipo: "invalido"; status: 400 | 503 }
  | { tipo: "redirigir"; origen: string; exito: true }
  | { tipo: "redirigir"; origen: string; exito: false; error: string };

export type ResultadoValidacionCallbackOAuth =
  | { tipo: "invalido"; status: 400 | 503 }
  | { tipo: "valido"; estado: EstadoOAuthVerificado };

export interface DependenciasValidacionCallbackOAuth {
  secreto: string;
}

export interface DependenciasCallbackOAuth extends DependenciasValidacionCallbackOAuth {
  manejarCallback(codigo: string, codeVerifier: string): Promise<void>;
  registrarError?(error: unknown): void;
}

/** Construye un relay al origen autenticado y solo reenvía parámetros permitidos. */
export function crearUrlRelayCallbackOAuth(
  estadoFirmado: string,
  estado: EstadoOAuthVerificado,
  codigo: string | null,
  errorProveedor: string | null,
): URL | null {
  if (!validarOrigenOAuth(estado.origen, estado.hostname)) return null;
  if (codigo && codigo.length > MAX_LONGITUD_CODIGO) return null;

  const destino = new URL(RUTA_CALLBACK_MERCADO_PAGO, estado.origen);
  destino.searchParams.set("state", estadoFirmado);
  if (errorProveedor) {
    destino.searchParams.set(
      "error",
      errorProveedor === "access_denied" ? "access_denied" : "oauth_error",
    );
  } else if (codigo) {
    destino.searchParams.set("code", codigo);
  }
  return destino;
}

/** Comprueba el estado firmado antes del relay o del intercambio. */
export async function validarContextoCallbackOAuth(
  estadoFirmado: string,
  dependencias: DependenciasValidacionCallbackOAuth,
  ahora = Date.now(),
): Promise<ResultadoValidacionCallbackOAuth> {
  const estado = leerEstadoOAuth(estadoFirmado, dependencias.secreto, ahora);
  if (!estado || !validarOrigenOAuth(estado.origen, estado.hostname)) {
    return { tipo: "invalido", status: 400 };
  }
  return { tipo: "valido", estado };
}

/** Canjea el código únicamente con sesión ADMIN y cookies vinculadas al inicio. */
export async function procesarCallbackOAuth(
  entrada: EntradaCallbackOAuth,
  dependencias: DependenciasCallbackOAuth,
  ahora = Date.now(),
): Promise<ResultadoCallbackOAuth> {
  if (
    !entrada.estado ||
    entrada.estadoCookie !== entrada.estado ||
    !entrada.codeVerifier ||
    !PATRON_VERIFICADOR_PKCE.test(entrada.codeVerifier)
  ) return { tipo: "invalido", status: 400 };

  const validacion = await validarContextoCallbackOAuth(entrada.estado, dependencias, ahora);
  if (validacion.tipo === "invalido") return validacion;
  const { estado } = validacion;
  if (!verificarEstadoOAuth(entrada.estado, entrada.hostRecibido, dependencias.secreto, ahora)) {
    return { tipo: "invalido", status: 400 };
  }

  if (entrada.errorProveedor) {
    return {
      tipo: "redirigir",
      origen: estado.origen,
      exito: false,
      error: entrada.errorProveedor === "access_denied"
        ? "autorizacion_cancelada" : "autorizacion_fallida",
    };
  }
  if (!entrada.codigo || entrada.codigo.length > MAX_LONGITUD_CODIGO) {
    return { tipo: "redirigir", origen: estado.origen, exito: false, error: "sin_codigo" };
  }

  try {
    await dependencias.manejarCallback(entrada.codigo, entrada.codeVerifier);
    return { tipo: "redirigir", origen: estado.origen, exito: true };
  } catch (error) {
    dependencias.registrarError?.(error);
    return { tipo: "redirigir", origen: estado.origen, exito: false, error: "conexion_fallida" };
  }
}
