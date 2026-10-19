"use server";

import { revalidateTag } from "next/cache";
import * as servicioColores from "@/lib/services/color-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function createColor(nombre: string, hexadecimal?: string) {
  try {
    const { tenantId } = await requiereAdmin();
    const nuevoColor = await servicioColores.createColor(tenantId, nombre, hexadecimal);
    revalidateTag(`tenant:${tenantId}:colors`);
    revalidateTag(`tenant:${tenantId}:products`);
    return { success: true, data: nuevoColor };
  } catch {
    return { error: "Error al crear el color o ya existe el nombre." };
  }
}
