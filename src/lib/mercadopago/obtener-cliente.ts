import "server-only";

import MercadoPagoConfig from "mercadopago";
import { obtenerTokenAccesoMP } from "./obtener-token-acceso";

/** Devuelve un cliente del SDK de Mercado Pago con el token vigente del comercio. */
export async function obtenerClienteMP(tenantId: string): Promise<MercadoPagoConfig> {
  const tokenAcceso = await obtenerTokenAccesoMP(tenantId);
  return new MercadoPagoConfig({
    accessToken: tokenAcceso,
    options: { timeout: 5000 },
  });
}
