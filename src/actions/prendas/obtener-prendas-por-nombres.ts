"use server";

import { obtenerCategoriasCatalogo } from "@/lib/services/categorias/obtener-categorias-catalogo";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { obtenerPrendasPaginadas } from "@/lib/services/prendas/obtener-prendas-paginadas";
import { serializarDatos } from "@/lib/utilidades/serializar-datos";
import { resolverElementoPorReferencia } from "@/lib/categorias/slugs-categoria";

export async function obtenerPrendasPorNombres(
  pagina: number,
  limite: number,
  categoria?: string,
  busqueda?: string,
  subcategoria?: string
) {
  const { id: idTenant } = await requiereTenantActivo();
  let idCategoria: string | undefined;
  let idSubcategoria: string | undefined;
  if (categoria || subcategoria) {
    const categorias = await obtenerCategoriasCatalogo(idTenant);
    idCategoria = resolverElementoPorReferencia(categorias, categoria)?.id;
    if (subcategoria && idCategoria) {
      const categoriaActual = categorias.find((categoriaActual) => categoriaActual.id === idCategoria);
      idSubcategoria = resolverElementoPorReferencia(categoriaActual?.subCategories ?? [], subcategoria)?.id;
    }
  }
  try {
    const resultado = await obtenerPrendasPaginadas(idTenant, pagina, limite, idCategoria, busqueda, idSubcategoria);
    return {
      success: true,
      data: serializarDatos(resultado.garments),
      total: resultado.total,
      page: resultado.page,
      totalPages: Math.ceil(resultado.total / resultado.limit),
    };
  } catch (error) {
    console.error("Error al cargar el catálogo:", error);
    return { error: "Error al cargar productos" };
  }
}
