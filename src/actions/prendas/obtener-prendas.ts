"use server";

import { obtenerProductosCacheados } from "@/lib/cache/obtener-productos-cacheados";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { serializarDatos as serializeData } from "@/lib/utilidades/serializar-datos";

export async function obtenerPrendas(
  pagina = 1,
  limite = 20,
  idCategoria?: string,
  busqueda?: string,
  idSubcategoria?: string
) {
  try {
    const { id: idTenant } = await requiereTenantActivo();
    const resultado = await obtenerProductosCacheados(idTenant, pagina, limite, idCategoria, busqueda, idSubcategoria);
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
