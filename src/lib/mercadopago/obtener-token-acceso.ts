import "server-only";

import { obtenerCuentaMP } from "./obtener-cuenta";
import { renovarTokenMP } from "./renovar-token";

/**
 * Devuelve un access_token vigente para la cuenta de Mercado Pago del comercio.
 * Si el token expiró y existe refresh_token, renueva automáticamente.
 */
export async function obtenerTokenAccesoMP(tenantId: string): Promise<string> {
  const cuenta = await obtenerCuentaMP(tenantId);
  if (!cuenta?.accessToken) {
    throw new Error("No hay una cuenta de Mercado Pago conectada");
  }

  if (cuenta.expiraEn && cuenta.expiraEn <= new Date()) {
    if (cuenta.refreshToken) return renovarTokenMP(tenantId);
    throw new Error(
      "El token de Mercado Pago expiró y no hay refresh_token para renovarlo",
    );
  }

  return cuenta.accessToken;
}
