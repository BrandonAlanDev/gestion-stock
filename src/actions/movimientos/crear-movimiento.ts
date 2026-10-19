"use server";

import { revalidateTag } from "next/cache";
import { crearMovimiento } from "@/lib/services/movimientos/crear-movimiento";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { esquemaMovimiento } from "@/lib/validaciones/movimientos/esquema-movimiento";

export async function createMovement(datos: unknown) {
  const contexto = await requiereAdmin();
  const resultado = esquemaMovimiento.safeParse(datos);
  if (!resultado.success) return { error: resultado.error.issues[0].message };

  try {
    const movimiento = await crearMovimiento(contexto.tenantId, resultado.data);
    revalidateTag(`tenant:${contexto.tenantId}:products`);
    return {
      success: true,
      data: { ...movimiento, priceAtTime: Number(movimiento.priceAtTime) },
    };
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : "";
    if (mensaje === "Stock insuficiente para realizar el egreso") {
      return { error: mensaje };
    }
    if (mensaje === "Variante no encontrada") return { error: mensaje };
    return { error: "No se pudo registrar el movimiento" };
  }
}
