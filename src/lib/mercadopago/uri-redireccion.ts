import "server-only";

import { headers } from "next/headers";
import { normalizarHostname } from "@/lib/tenants/normalizar-hostname";
import { construirOrigenSolicitud } from "@/lib/tenants/construir-origen-solicitud";
import { RUTA_CALLBACK_MERCADO_PAGO } from "./constantes";

export { RUTA_CALLBACK_MERCADO_PAGO };

/** Devuelve la URI fija registrada en Mercado Pago, si está configurada. */
export function obtenerUriRedireccionFija(configurada = process.env.MP_REDIRECT_URI): URL | null {
  const valor = configurada?.trim();
  if (!valor) return null;

  let uri: URL;
  try {
    uri = new URL(valor);
  } catch {
    throw new Error("MP_REDIRECT_URI debe ser una URL HTTPS absoluta y válida");
  }
  if (
    uri.protocol !== "https:" ||
    uri.username ||
    uri.password ||
    uri.port ||
    uri.pathname !== RUTA_CALLBACK_MERCADO_PAGO ||
    uri.search ||
    uri.hash ||
    !normalizarHostname(uri.hostname)
  ) {
    throw new Error(`MP_REDIRECT_URI debe ser HTTPS y terminar exactamente en ${RUTA_CALLBACK_MERCADO_PAGO}`);
  }
  return uri;
}

/** Detecta la llegada al callback central sin confiar en x-forwarded-host. */
export function esSolicitudCallbackFijo(
  hostRecibido: string,
  ruta: string,
  produccion = process.env.NODE_ENV === "production",
): boolean {
  const uriFija = obtenerUriRedireccionFija();
  if (!uriFija || ruta !== RUTA_CALLBACK_MERCADO_PAGO) return false;
  const origenRecibido = construirOrigenSolicitud(
    hostRecibido,
    uriFija.protocol === "https:" || produccion,
  );
  return origenRecibido === uriFija.origin;
}

/**
 * Usa una URI común registrada para todos los dominios. En desarrollo, cuando
 * no existe, conserva el callback en el mismo hostname que inició OAuth.
 */
export async function obtenerUriRedireccion(): Promise<string> {
  const fija = obtenerUriRedireccionFija();
  if (fija) return process.env.MP_REDIRECT_URI!.trim();
  if (process.env.NODE_ENV === "production") {
    throw new Error("MP_REDIRECT_URI es obligatorio en producción para usar el callback OAuth central");
  }

  const cabeceras = await headers();
  const hostRecibido = cabeceras.get("host") ?? "";
  const hostname = normalizarHostname(hostRecibido);
  const origen = construirOrigenSolicitud(
    hostRecibido,
    false,
  );
  if (!hostname || !origen) {
    throw new Error("No se pudo determinar el host de la solicitud OAuth");
  }

  return new URL(RUTA_CALLBACK_MERCADO_PAGO, origen).toString();
}
