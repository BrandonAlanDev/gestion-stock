"use server";

import { obtenerCategoriasCacheadas } from "@/lib/cache/obtener-categorias-cacheadas";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { obtenerPrendas } from "./obtener-prendas";

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
    const categorias = await obtenerCategoriasCacheadas(idTenant);
    if (categoria) {
      const categoriaDecodificada = decodeURIComponent(categoria).trim().toLowerCase();
      idCategoria = categorias.find((categoriaActual) => categoriaActual.id === categoriaDecodificada || categoriaActual.name.trim().toLowerCase() === categoriaDecodificada)?.id;
    }
    if (subcategoria && idCategoria) {
      const subcategoriaDecodificada = decodeURIComponent(subcategoria).trim().toLowerCase();
      idSubcategoria = categorias
        .find((categoriaActual) => categoriaActual.id === idCategoria)
        ?.subCategories.find((subcategoriaActual) => subcategoriaActual.id === subcategoriaDecodificada || subcategoriaActual.name.trim().toLowerCase() === subcategoriaDecodificada)?.id;
    }
  }
  return obtenerPrendas(pagina, limite, idCategoria, busqueda, idSubcategoria);
}
