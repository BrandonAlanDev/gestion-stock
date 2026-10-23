"use server";

import "server-only";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrismaTenant } from "@/lib/prisma";
import type { MetodoPagoId } from "@/lib/pagos/tipos";
import { METODOS_PAGO_CONOCIDOS } from "@/lib/pagos/constantes";

export type ResultadoActivacion = { success: boolean; error?: string };

/**
 * Activa o desactiva un método de pago del comercio. No modifica la conexión:
 * una cuenta puede estar conectada pero el método permanecer desactivado.
 */
export async function activarMetodo(
  metodo: MetodoPagoId,
  activo: boolean,
): Promise<ResultadoActivacion> {
  try {
    const contexto = await requiereAdmin();
    if (!METODOS_PAGO_CONOCIDOS.some((definicion) => definicion.id === metodo)) {
      return { success: false, error: "Método de pago inválido" };
    }

    await conPrismaTenant(contexto.tenantId, (prisma) => prisma.metodoPago.upsert({
      where: {
        metodo,
      },
      create: {
        metodo,
        activo,
      },
      update: {
        activo,
        updatedAt: new Date(),
      },
    }));

    return { success: true };
  } catch (error) {
    console.error(
      "Error activando método de pago:",
      error instanceof Error ? error.message : String(error),
    );
    return { success: false, error: "No se pudo actualizar el método de pago" };
  }
}
