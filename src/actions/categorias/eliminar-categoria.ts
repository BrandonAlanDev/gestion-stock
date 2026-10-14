"use server";

import { revalidateTag } from "next/cache";
import * as servicioCategorias from "@/lib/services/category-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function deleteCategory(id: string) {
  try {
    const { tenantId } = await requiereAdmin();
    const cantidadSubcategorias = await servicioCategorias.getSubCategoriesCount(tenantId, id);
    if (cantidadSubcategorias > 0) {
      return { error: `No se puede eliminar. Tenés ${cantidadSubcategorias} subcategorías vinculadas.` };
    }
    await servicioCategorias.deleteCategory(tenantId, id);
    revalidateTag(`tenant:${tenantId}:categories`);
    revalidateTag(`tenant:${tenantId}:products`);
    return { success: true };
  } catch (error) {
    console.error("Error al borrar categoría:", error);
    return { error: "No se puede eliminar la categoría porque tiene dependencias activas." };
  }
}
