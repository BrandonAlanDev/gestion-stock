"use server";

import "server-only";
import { z } from "zod";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrismaTenant } from "@/lib/prisma";
import { registrarErrorPagoSeguro } from "@/lib/pagos/registro-error-seguro";
import { combinarConfigMetodoPago } from "@/lib/pagos/configuracion-metodo";

const esquemaConfiguracion = z.object({
  metodo: z.enum(["efectivo", "transferencia", "mercadopago"]),
  instrucciones: z.string().trim().max(5000).nullable().optional(),
  vencimiento: z.object({
    habilitado: z.boolean(),
    horas: z.number().int().min(1).max(720),
  }).optional(),
}).strict().refine(
  (datos) => datos.instrucciones !== undefined || datos.vencimiento !== undefined,
  "No se recibió ninguna configuración para guardar",
);

export type DatosConfigMetodo = z.infer<typeof esquemaConfiguracion>;

export type ResultadoConfigMetodo = { success: boolean; error?: string };

function esConflictoUnico(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error &&
    error.code === "P2002";
}

/**
 * Mezcla la configuración de cada método con el JSON existente y usa updatedAt
 * como control optimista para no perder claves ante ediciones concurrentes.
 */
export async function guardarConfigMetodo(
  entrada: unknown,
): Promise<ResultadoConfigMetodo> {
  try {
    const validacion = esquemaConfiguracion.safeParse(entrada);
    if (!validacion.success) {
      return { success: false, error: "La configuración recibida no es válida" };
    }
    const datos = validacion.data;
    if (datos.metodo === "mercadopago") {
      return { success: false, error: "Mercado Pago no admite esta configuración" };
    }
    if (datos.metodo === "efectivo" && datos.instrucciones !== undefined) {
      return { success: false, error: "El efectivo no admite instrucciones bancarias" };
    }

    const contexto = await requiereAdmin();

    for (let intento = 0; intento < 5; intento += 1) {
      try {
        const guardado = await conPrismaTenant(contexto.tenantId, (prisma) =>
          prisma.$transaction(async (tx) => {
            const actual = await tx.metodoPago.findUnique({
              where: { metodo: datos.metodo },
              select: { id: true, activo: true, config: true, updatedAt: true },
            });
            const config = combinarConfigMetodoPago(actual?.config, datos);

            if (!actual) {
              await tx.metodoPago.create({
                data: { metodo: datos.metodo, activo: false, config },
              });
              return true;
            }

            const siguienteActualizacion = new Date(
              Math.max(Date.now(), actual.updatedAt.getTime() + 1),
            );
            const actualizado = await tx.metodoPago.updateMany({
              where: { id: actual.id, updatedAt: actual.updatedAt },
              data: { config, updatedAt: siguienteActualizacion },
            });
            return actualizado.count === 1;
          }),
        );
        if (guardado) return { success: true };
      } catch (error) {
        if (!esConflictoUnico(error)) throw error;
      }
    }

    return { success: false, error: "La configuración cambió en otra sesión. Volvé a intentarlo." };
  } catch (error) {
    registrarErrorPagoSeguro("Error guardando configuración del método de pago", error, "transferencia");
    return { success: false, error: "No se pudo guardar la configuración" };
  }
}
