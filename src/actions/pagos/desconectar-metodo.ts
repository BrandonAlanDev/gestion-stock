"use server";

import "server-only";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { obtenerProveedor } from "@/lib/pagos/registro";
import type { MetodoPagoId } from "@/lib/pagos/tipos";

export type ResultadoDesconectarMetodo = { success: boolean; error?: string };

/**
 * Desconecta la cuenta externa de un método de pago (por ejemplo, la cuenta de
 * Mercado Pago del comercio). El método queda desactivado hasta reconectar.
 */
export async function desconectarMetodo(
  metodo: MetodoPagoId,
): Promise<ResultadoDesconectarMetodo> {
  try {
    const contexto = await requiereAdmin();
    const proveedor = obtenerProveedor(metodo);
    await proveedor.desconectar(contexto.tenantId);
    return { success: true };
  } catch (error) {
    console.error(
      "Error desconectando método de pago:",
      error instanceof Error ? error.message : String(error),
    );
    return { success: false, error: "No se pudo desconectar" };
  }
}
