"use server";

import "server-only";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { eliminarCuentaMP } from "@/lib/mercadopago/eliminar-cuenta";

export type ResultadoDesconectarMP = { success: boolean; error?: string };

/** Desconecta la cuenta de Mercado Pago del comercio. */
export async function desconectarMP(): Promise<ResultadoDesconectarMP> {
  try {
    const contexto = await requiereAdmin();
    await eliminarCuentaMP(contexto.tenantId);
    return { success: true };
  } catch (error) {
    console.error(
      "Error al desconectar Mercado Pago:",
      error instanceof Error ? error.message : String(error),
    );
    return { success: false, error: "No se pudo desconectar la cuenta" };
  }
}
