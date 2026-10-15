import "server-only";

import { prisma } from "@/lib/prisma";
import type { RespuestaTokenMP, OpcionesGuardarCuentaMP } from "@/types/mercadopago";

/**
 * Guarda o actualiza la conexión de Mercado Pago de un comercio tras el OAuth,
 * sin exponer los tokens fuera de la base de datos.
 */
export async function guardarCuentaMP(
  tenantId: string,
  datos: RespuestaTokenMP,
  opciones: OpcionesGuardarCuentaMP = {},
) {
  const expiraEn = datos.expires_in
    ? new Date(Date.now() + datos.expires_in * 1000)
    : null;

  await prisma.cuentaMercadoPago.upsert({
    where: { tenantId },
    create: {
      tenantId,
      accessToken: datos.access_token,
      refreshToken: datos.refresh_token ?? null,
      publicKey: datos.public_key ?? null,
      mpUserId: datos.user_id ? String(datos.user_id) : null,
      scope: datos.scope ?? null,
      liveMode: datos.live_mode ?? false,
      conectado: opciones.conectado ?? true,
      expiraEn,
    },
    update: {
      accessToken: datos.access_token,
      refreshToken: datos.refresh_token ?? null,
      publicKey: datos.public_key ?? null,
      mpUserId: datos.user_id ? String(datos.user_id) : null,
      scope: datos.scope ?? null,
      liveMode: datos.live_mode ?? false,
      conectado: opciones.conectado ?? true,
      expiraEn,
      updatedAt: new Date(),
    },
  });
}
