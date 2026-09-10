"use server";

import "server-only";
import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import type { MetodoPagoId } from "@/lib/pagos/tipos";

export type DatosConfigMetodo = {
  metodo: MetodoPagoId;
  instrucciones?: string | null;
};

export type ResultadoConfigMetodo = { success: boolean; error?: string };

/**
 * Guarda la configuración propia de un método de pago (por ahora, las
 * instrucciones de la transferencia bancaria). El campo config es un JSON que
 * cada proveedor interpreta a su manera.
 */
export async function guardarConfigMetodo(
  datos: DatosConfigMetodo,
): Promise<ResultadoConfigMetodo> {
  try {
    const contexto = await requiereAdmin();

    const instrucciones =
      typeof datos.instrucciones === "string" ? datos.instrucciones.trim() : null;

    await prisma.metodoPago.upsert({
      where: {
        tenantId_metodo: {
          tenantId: contexto.tenantId,
          metodo: datos.metodo,
        },
      },
      create: {
        tenantId: contexto.tenantId,
        metodo: datos.metodo,
        config: { instrucciones },
        activo: false,
      },
      update: {
        config: { instrucciones },
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error(
      "Error guardando configuración del método:",
      error instanceof Error ? error.message : String(error),
    );
    return { success: false, error: "No se pudo guardar la configuración" };
  }
}
