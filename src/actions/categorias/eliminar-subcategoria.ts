"use server";

import { revalidateTag } from "next/cache";
import * as servicioCategorias from "@/lib/services/category-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function deleteSubCategory(id: string) {
  try {
    const { tenantId } = await requiereAdmin();
    if (!id) {
      return { error: "ID de subcategoría no provisto." };
    }
    const cantidadProductos = await servicioCategorias.getGarmentCountBySubCategory(tenantId, id);
    if (cantidadProductos > 0) {
      return { error: `No se puede eliminar. Hay ${cantidadProductos} producto(s) asignado(s).` };
    }
    await servicioCategorias.deleteSubCategory(tenantId, id);
    revalidateTag(`tenant:${tenantId}:categories`);
    revalidateTag(`tenant:${tenantId}:products`);
    return { success: true };
  } catch (error) {
    console.error("Error en deleteSubCategoryAction:", error);
    return { error: "Ocurrió un error al intentar eliminar la subcategoría." };
  }
}
