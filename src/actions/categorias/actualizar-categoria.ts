"use server";

import { revalidateTag } from "next/cache";
import { actualizarCategoria } from "@/lib/services/categorias/actualizar-categoria";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function updateCategory(id: string, datos: { name: string; description?: string }) {
  try {
    const { tenantId } = await requiereAdmin();
    const categoriaActualizada = await actualizarCategoria(tenantId, id, datos);
    revalidateTag(`tenant:${tenantId}:categories`);
    revalidateTag(`tenant:${tenantId}:products`);
    return { success: true, data: categoriaActualizada };
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return { error: "Error al actualizar los datos." };
  }
}
