import "server-only";

import { obtenerHostnameSolicitud } from "@/lib/tenants/obtener-hostname-solicitud";

/**
 * Construye la URI de redirección exacta que debe estar registrada en el panel
 * de Mercado Pago (Tu aplicación → URL de redirección). En multi-tenant se
 * deriva del host de la solicitud para que cada comercio tenga la correcta.
 */
export async function obtenerUriRedireccion(): Promise<string> {
  const baseConfigurada =
    process.env.MP_REDIRECT_URI || process.env.NEXT_PUBLIC_APP_URL;

  if (baseConfigurada) {
    return `${baseConfigurada.replace(/\/$/, "")}/api/mercadopago/oauth/callback`;
  }

  const host = await obtenerHostnameSolicitud();
  if (!host) {
    throw new Error(
      "No se pudo determinar el host para la URI de redirección. " +
        "Configurá MP_REDIRECT_URI o NEXT_PUBLIC_APP_URL.",
    );
  }

  return `https://${host}/api/mercadopago/oauth/callback`;
}
