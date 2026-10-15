import "server-only";

import { prisma } from "@/lib/prisma";
import { URL_TOKEN_MP } from "./constantes";
import type { RespuestaTokenMP } from "@/types/mercadopago";

/**
 * Renueva el access_token de la cuenta de Mercado Pago de un comercio usando el
 * refresh_token, y persiste el nuevo conjunto de tokens. Devuelve el token nuevo.
 */
export async function renovarTokenMP(tenantId: string): Promise<string> {
  const cuenta = await prisma.cuentaMercadoPago.findUnique({
    where: { tenantId },
  });

  if (!cuenta?.refreshToken) {
    throw new Error(
      "No hay refresh_token para renovar el token de Mercado Pago",
    );
  }

  const cuerpo = {
    client_id: process.env.MP_CLIENT_ID,
    client_secret: process.env.MP_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: cuenta.refreshToken,
  };

  const respuesta = await fetch(URL_TOKEN_MP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });

  const datos = (await respuesta.json()) as RespuestaTokenMP;

  if (!respuesta.ok) {
    console.error("Error al renovar el token de MP:", respuesta.status);
    throw new Error(
      datos?.message ||
        datos?.error_description ||
        `Error ${respuesta.status} al renovar el token de Mercado Pago`,
    );
  }

  await prisma.cuentaMercadoPago.update({
    where: { tenantId },
    data: {
      accessToken: datos.access_token,
      refreshToken: datos.refresh_token ?? cuenta.refreshToken,
      expiraEn: datos.expires_in
        ? new Date(Date.now() + datos.expires_in * 1000)
        : cuenta.expiraEn,
      liveMode: datos.live_mode ?? cuenta.liveMode,
      updatedAt: new Date(),
    },
  });

  return datos.access_token;
}
