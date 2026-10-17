"use server";

import { revalidateTag } from "next/cache";
import { crearCategoria } from "@/lib/services/categorias/crear-categoria";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function createCategory(datosFormulario: { name: string; description?: string }) {
  try {
    const { tenantId } = await requiereAdmin();
    const nuevaCategoria = await crearCategoria(tenantId, datosFormulario.name);
    revalidateTag(`categories`);
    revalidateTag(`products`);
    return { success: true, data: nuevaCategoria };
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return { error: "Error al crear categoría" };
  }
}
