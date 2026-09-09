import "server-only";

import { URL_TOKEN_MP } from "./constantes";
import { validarConfiguracionOAuthMP } from "./validar-configuracion";
import { obtenerUriRedireccion } from "./uri-redireccion";
import type { RespuestaTokenMP } from "@/types/mercadopago";

/**
 * Intercambia el código de autorización que devuelve Mercado Pago por los
 * tokens reales de la cuenta que se está conectando.
 */
export async function intercambiarCodigoPorToken(
  codigo: string,
  codeVerifier: string,
): Promise<RespuestaTokenMP> {
  validarConfiguracionOAuthMP();

  const redirectUri = await obtenerUriRedireccion();

  const cuerpo = {
    client_id: process.env.MP_CLIENT_ID,
    client_secret: process.env.MP_CLIENT_SECRET,
    grant_type: "authorization_code",
    code: codigo,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  };

  const respuesta = await fetch(URL_TOKEN_MP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });

  const datos = (await respuesta.json()) as RespuestaTokenMP;

  if (!respuesta.ok) {
    console.error("Error al intercambiar el código de autorización MP. Status:", respuesta.status);
    throw new Error(
      datos?.message ||
        datos?.error_description ||
        `Error ${respuesta.status} al conectar con Mercado Pago`,
    );
  }

  return datos;
}
