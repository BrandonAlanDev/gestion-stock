"use server";

import { revalidateTag } from "next/cache";
import { getCachedCategories } from "@/lib/cache";
import * as categoryService from "@/lib/services/category-service";

// Lectura cacheada
export const getCategories = getCachedCategories;

export async function createCategory(formData: { name: string; description?: string }) {
  try {
    const newCategory = await categoryService.createCategory(formData.name);
    revalidateTag("categories");
    return { success: true, data: newCategory };
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return { error: "Error al crear categoría" };
  }
}

export async function updateCategory(id: string, data: { name: string; description?: string }) {
  try {
    const updated = await categoryService.updateCategory(id, data);
    revalidateTag("categories");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return { error: "Error al actualizar los datos." };
  }
}

export async function deleteCategory(id: string) {
  try {
    const subCatsCount = await categoryService.getSubCategoriesCount(id);
    if (subCatsCount > 0) {
      return { error: `No se puede eliminar. Tenés ${subCatsCount} subcategorías vinculadas.` };
    }
    await categoryService.deleteCategory(id);
    revalidateTag("categories");
    return { success: true };
  } catch (error) {
    console.error("Error al borrar categoría:", error);
    return { error: "No se puede eliminar la categoría porque tiene dependencias activas." };
  }
}

export async function createSubCategory(data: { name: string; categoryId: string; sizeTypeId: string | null }) {
  try {
    if (!data.name || !data.categoryId) return { error: "El nombre y la categoría madre son obligatorios." };
    const newSub = await categoryService.createSubCategory(data);
    revalidateTag("categories");
    return { success: true, data: newSub };
  } catch (error: any) {
    console.error("Error en createSubCategoryAction:", error);
    if (error.code === "P2002") return { error: "Ya existe una subcategoría con ese nombre en este grupo." };
    return { error: "No se pudo crear la subcategoría." };
  }
}

export async function deleteSubCategory(id: string) {
  try {
    if (!id) return { error: "ID de subcategoría no provisto." };
    const garmentsCount = await categoryService.getGarmentCountBySubCategory(id);
    if (garmentsCount > 0) return { error: `No se puede eliminar. Hay ${garmentsCount} producto(s) asignado(s).` };
    await categoryService.deleteSubCategory(id);
    revalidateTag("categories");
    return { success: true };
  } catch (error) {
    console.error("Error en deleteSubCategoryAction:", error);
    return { error: "Ocurrió un error al intentar eliminar la subcategoría." };
  }
}