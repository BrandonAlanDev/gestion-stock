"use server";

import { revalidateTag } from "next/cache";
import { contarSubcategorias } from "@/lib/services/categorias/contar-subcategorias";
import { eliminarCategoria } from "@/lib/services/categorias/eliminar-categoria";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function deleteCategory(id: string) {
  try {
    const { tenantId } = await requiereAdmin();
    const cantidadSubcategorias = await contarSubcategorias(tenantId, id);
    if (cantidadSubcategorias > 0) {
      return { error: `No se puede eliminar. Tenés ${cantidadSubcategorias} subcategorías vinculadas.` };
    }
    await eliminarCategoria(tenantId, id);
    revalidateTag(`categories`);
    revalidateTag(`products`);
    return { success: true };
  } catch (error) {
    console.error("Error al borrar categoría:", error);
    return { error: "No se puede eliminar la categoría porque tiene dependencias activas." };
  }
}
