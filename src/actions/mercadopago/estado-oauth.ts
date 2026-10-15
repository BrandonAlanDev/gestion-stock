"use server";

import "server-only";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { obtenerUriRedireccion } from "@/lib/mercadopago/uri-redireccion";
import type { EstadoOAuthMP } from "@/types/mercadopago";

/** Devuelve el estado de las variables de OAuth sin exponer los valores reales. */
export async function obtenerEstadoOAuthMP(): Promise<EstadoOAuthMP> {
  try {
    await requiereAdmin();

    let uriRedireccion: string | null = null;
    try {
      uriRedireccion = await obtenerUriRedireccion();
    } catch {
      uriRedireccion = null;
    }

    return {
      clientIdConfigurado: !!process.env.MP_CLIENT_ID,
      clientSecretConfigurado: !!process.env.MP_CLIENT_SECRET,
      uriRedireccion,
    };
  } catch {
    return {
      clientIdConfigurado: false,
      clientSecretConfigurado: false,
      uriRedireccion: null,
    };
  }
}
