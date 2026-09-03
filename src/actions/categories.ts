"use server";

import { revalidateTag } from "next/cache";
import { getCachedCategories } from "@/lib/cache";
import * as categoryService from "@/lib/services/category-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

function revalidarCategorias(tenantId: string): void {
  revalidateTag(`tenant:${tenantId}:categories`);
}

export async function getCategories() {
  const { tenantId } = await requiereAdmin();
  return getCachedCategories(tenantId);
}

export async function createCategory(formData: { name: string; description?: string }) {
  try {
    const { tenantId } = await requiereAdmin();
    const newCategory = await categoryService.createCategory(tenantId, formData.name);
    revalidarCategorias(tenantId);
    return { success: true, data: newCategory };
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return { error: "Error al crear categoría" };
  }
}

export async function updateCategory(id: string, data: { name: string; description?: string }) {
  try {
    const { tenantId } = await requiereAdmin();
    const updated = await categoryService.updateCategory(tenantId, id, data);
    revalidarCategorias(tenantId);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return { error: "Error al actualizar los datos." };
  }
}

export async function deleteCategory(id: string) {
  try {
    const { tenantId } = await requiereAdmin();
    const subCatsCount = await categoryService.getSubCategoriesCount(tenantId, id);
    if (subCatsCount > 0) {
      return { error: `No se puede eliminar. Tenés ${subCatsCount} subcategorías vinculadas.` };
    }
    await categoryService.deleteCategory(tenantId, id);
    revalidarCategorias(tenantId);
    return { success: true };
  } catch (error) {
    console.error("Error al borrar categoría:", error);
    return { error: "No se puede eliminar la categoría porque tiene dependencias activas." };
  }
}

export async function createSubCategory(data: { name: string; categoryId: string; sizeTypeId: string | null }) {
  try {
    const { tenantId } = await requiereAdmin();
    if (!data.name || !data.categoryId) return { error: "El nombre y la categoría madre son obligatorios." };
    const newSub = await categoryService.createSubCategory(tenantId, data);
    revalidarCategorias(tenantId);
    return { success: true, data: newSub };
  } catch (error: unknown) {
    console.error("Error en createSubCategoryAction:", error);
    if ((error as { code?: string }).code === "P2002") return { error: "Ya existe una subcategoría con ese nombre en este grupo." };
    return { error: "No se pudo crear la subcategoría." };
  }
}

export async function deleteSubCategory(id: string) {
  try {
    const { tenantId } = await requiereAdmin();
    if (!id) return { error: "ID de subcategoría no provisto." };
    const garmentsCount = await categoryService.getGarmentCountBySubCategory(tenantId, id);
    if (garmentsCount > 0) return { error: `No se puede eliminar. Hay ${garmentsCount} producto(s) asignado(s).` };
    await categoryService.deleteSubCategory(tenantId, id);
    revalidarCategorias(tenantId);
    return { success: true };
  } catch (error) {
    console.error("Error en deleteSubCategoryAction:", error);
    return { error: "Ocurrió un error al intentar eliminar la subcategoría." };
  }
}
