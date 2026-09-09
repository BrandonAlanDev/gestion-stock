import "server-only";

import { URL_BASE_AUTORIZACION } from "./constantes";
import { validarConfiguracionOAuthMP } from "./validar-configuracion";
import { obtenerUriRedireccion } from "./uri-redireccion";

/**
 * Construye la URL a la que se redirige al admin para autorizar la aplicación
 * en su cuenta de Mercado Pago (con PKCE S256).
 */
export async function construirUrlAutorizacionMP(
  estado: string,
  codeChallenge: string,
): Promise<string> {
  validarConfiguracionOAuthMP();
  const redirectUri = await obtenerUriRedireccion();

  const parametros = new URLSearchParams({
    client_id: process.env.MP_CLIENT_ID ?? "",
    response_type: "code",
    redirect_uri: redirectUri,
    state: estado,
    scope: "read write offline_access",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `${URL_BASE_AUTORIZACION}/authorization?${parametros.toString()}`;
}
