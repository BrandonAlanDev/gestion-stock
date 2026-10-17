"use server";

import { revalidateTag } from "next/cache";
import { contarPrendasPorSubcategoria } from "@/lib/services/categorias/contar-prendas-por-subcategoria";
import { eliminarSubcategoria } from "@/lib/services/categorias/eliminar-subcategoria";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function deleteSubCategory(id: string) {
  try {
    const { tenantId } = await requiereAdmin();
    if (!id) {
      return { error: "ID de subcategoría no provisto." };
    }
    const cantidadProductos = await contarPrendasPorSubcategoria(tenantId, id);
    if (cantidadProductos > 0) {
      return { error: `No se puede eliminar. Hay ${cantidadProductos} producto(s) asignado(s).` };
    }
    await eliminarSubcategoria(tenantId, id);
    revalidateTag(`categories`);
    revalidateTag(`products`);
    return { success: true };
  } catch (error) {
    console.error("Error en deleteSubCategoryAction:", error);
    return { error: "Ocurrió un error al intentar eliminar la subcategoría." };
  }
}
