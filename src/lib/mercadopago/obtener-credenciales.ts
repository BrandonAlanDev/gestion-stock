import "server-only";

import MercadoPagoConfig from "mercadopago";
import { obtenerTokenAccesoMP } from "@/lib/mercadopago/obtener-token-acceso";

export type CredencialesMP = {
  cliente: MercadoPagoConfig;
  tokenAcceso: string;
};

/**
 * Devuelve el cliente del SDK de Mercado Pago junto con el access_token vigente
 * del comercio, en una sola lectura, para evitar consultar el token dos veces.
 */
export async function obtenerCredencialesMP(
  tenantId: string,
): Promise<CredencialesMP> {
  const tokenAcceso = await obtenerTokenAccesoMP(tenantId);
  return {
    cliente: new MercadoPagoConfig({
      accessToken: tokenAcceso,
      options: { timeout: 5000 },
    }),
    tokenAcceso,
  };
}
