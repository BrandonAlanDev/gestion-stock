// Punto único de URLs y constantes de Mercado Pago.

export const URL_TOKEN_MP = "https://api.mercadopago.com/oauth/token";

export const URL_BASE_AUTORIZACION =
  process.env.MP_AUTH_BASE_URL || "https://auth.mercadopago.com.ar";
