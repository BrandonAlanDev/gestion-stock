"use server";

import { revalidateTag } from "next/cache";
import * as servicioCategorias from "@/lib/services/category-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function createCategory(datosFormulario: { name: string; description?: string }) {
  try {
    const { tenantId } = await requiereAdmin();
    const nuevaCategoria = await servicioCategorias.createCategory(tenantId, datosFormulario.name);
    revalidateTag(`tenant:${tenantId}:categories`);
    revalidateTag(`tenant:${tenantId}:products`);
    return { success: true, data: nuevaCategoria };
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return { error: "Error al crear categoría" };
  }
}
