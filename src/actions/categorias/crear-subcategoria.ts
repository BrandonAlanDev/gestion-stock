"use server";

import { revalidateTag } from "next/cache";
import * as servicioCategorias from "@/lib/services/category-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function createSubCategory(datos: { name: string; categoryId: string; sizeTypeId: string | null }) {
  try {
    const { tenantId } = await requiereAdmin();
    if (!datos.name || !datos.categoryId) {
      return { error: "El nombre y la categoría madre son obligatorios." };
    }
    const nuevaSubcategoria = await servicioCategorias.createSubCategory(tenantId, datos);
    revalidateTag(`tenant:${tenantId}:categories`);
    revalidateTag(`tenant:${tenantId}:products`);
    return { success: true, data: nuevaSubcategoria };
  } catch (error: unknown) {
    console.error("Error en createSubCategoryAction:", error);
    if ((error as { code?: string }).code === "P2002") {
      return { error: "Ya existe una subcategoría con ese nombre en este grupo." };
    }
    return { error: "No se pudo crear la subcategoría." };
  }
}
