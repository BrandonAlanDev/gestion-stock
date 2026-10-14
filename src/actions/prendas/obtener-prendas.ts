"use server";

import { getCachedProducts } from "@/lib/cache";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { serializeData } from "@/lib/utils";

export async function obtenerPrendas(
  pagina = 1,
  limite = 20,
  idCategoria?: string,
  busqueda?: string,
  idSubcategoria?: string
) {
  try {
    const { id: idTenant } = await requiereTenantActivo();
    const resultado = await getCachedProducts(idTenant, pagina, limite, idCategoria, busqueda, idSubcategoria);
    const { garments, total } = resultado;
    return {
      success: true,
      data: serializeData(garments),
      total,
      page: resultado.page,
      totalPages: Math.ceil(total / resultado.limit),
    };
  } catch (error: unknown) {
    console.error("Error en obtenerPrendas:", error);
    return { error: "Error al cargar productos" };
  }
}
