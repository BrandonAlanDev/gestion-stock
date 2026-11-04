"use client";

import { useQuery } from "@tanstack/react-query";
import { obtenerPrendasPorNombres } from "@/actions/prendas/obtener-prendas-por-nombres";
import { obtenerPaginaCatalogoFaltante } from "@/actions/prendas/obtener-pagina-catalogo-faltante";
import {
  guardarPaginaCatalogo,
  leerPaginaCatalogo,
  leerPaginaFiltradaCompleta,
  leerProductosCatalogo,
} from "@/lib/productos/cache-cliente";
import type { CategoriaCatalogo, ProductoCatalogo } from "@/types/productos/catalogo-publico";

export type ResultadoCatalogo = {
  success: boolean;
  data: ProductoCatalogo[];
  total: number;
  page: number;
  totalPages: number;
  obtenidoEn?: number;
};

function leerResultadoLocal(
  tenantId: string,
  page: number,
  limit: number,
  categoria?: string,
  subcategoria?: string,
  categories?: CategoriaCatalogo[]
): ResultadoCatalogo | null {
  if (typeof window === "undefined") return null;

  const categoriaBuscada = categoria?.trim().toLocaleLowerCase("es-AR");
  const categoriaActual = categoriaBuscada
    ? categories?.find((item) => item.id === categoriaBuscada || item.name.trim().toLocaleLowerCase("es-AR") === categoriaBuscada)
    : undefined;
  const subcategoriaBuscada = subcategoria?.trim().toLocaleLowerCase("es-AR");
  const subcategoriaActual = subcategoriaBuscada
    ? categoriaActual?.subCategories.find((item) => item.id === subcategoriaBuscada || item.name.trim().toLocaleLowerCase("es-AR") === subcategoriaBuscada)
    : undefined;
  const totalEsperado = subcategoriaActual?.totalProductos ?? categoriaActual?.totalProductos;

  if (categoriaActual && totalEsperado !== undefined && (!subcategoriaBuscada || subcategoriaActual)) {
    const completa = leerPaginaFiltradaCompleta(
      tenantId, page, limit, categoriaActual.id, subcategoriaActual?.id, totalEsperado
    );
    if (completa) return { success: true, data: completa.productos, total: completa.total,
      page, totalPages: completa.paginasTotales, obtenidoEn: completa.obtenidoEn };
  }

  const paginaLocal = leerPaginaCatalogo(tenantId, page, limit, categoria, subcategoria);
  if (paginaLocal && (totalEsperado === undefined || paginaLocal.total === totalEsperado)) {
    return { success: true, data: paginaLocal.productos, total: paginaLocal.total,
      page, totalPages: paginaLocal.paginasTotales, obtenidoEn: paginaLocal.obtenidoEn };
  }
  return null;
}

export function useCatalogGarments(
  tenantId: string,
  page: number,
  limit: number,
  categoria?: string,
  search?: string,
  subcategoria?: string,
  categories?: CategoriaCatalogo[],
  initialData?: ResultadoCatalogo,
  categoriasActualizadasEn?: number
) {
  return useQuery<ResultadoCatalogo>({
    queryKey: ["catalogProducts", { tenantId, page, limit, categoria, search, subcategoria, categoriasActualizadasEn }],
    queryFn: async () => {
      if (search) {
        const resultado = await obtenerPrendasPorNombres(page, limit, categoria, search, subcategoria);
        if ("error" in resultado) return { success: false, data: [], total: 0, page, totalPages: 0 };
        return resultado;
      }

      const local = leerResultadoLocal(tenantId, page, limit, categoria, subcategoria, categories);
      if (local) return local;

      const conocidos = leerProductosCatalogo(tenantId);
      const resultado = await obtenerPaginaCatalogoFaltante(
        page, limit, categoria, subcategoria,
        conocidos.map(({ datos }) => ({ id: datos.id, updatedAt: datos.updatedAt, slug: datos.slug }))
      );
      if ("error" in resultado) return { success: false, data: [], total: 0, page, totalPages: 0 };

      const productosPorId = new Map<string, ProductoCatalogo>(
        conocidos.map(({ datos }) => [datos.id, datos])
      );
      for (const producto of resultado.data) productosPorId.set(producto.id, producto);
      const productos = resultado.ids.map((id) => productosPorId.get(id));
      if (productos.some((producto) => !producto)) {
        return { success: false, data: [], total: 0, page, totalPages: 0 };
      }
      const pagina = productos as ProductoCatalogo[];
      const obtenidoEn = Date.now();
      guardarPaginaCatalogo(tenantId, page, limit, categoria, subcategoria, pagina, resultado.total, obtenidoEn);
      return { success: true, data: pagina, total: resultado.total,
        page: resultado.page, totalPages: resultado.totalPages, obtenidoEn };
    },
    initialData,
    initialDataUpdatedAt: initialData?.obtenidoEn,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: () => {
      if (search) return undefined;
      return leerResultadoLocal(tenantId, page, limit, categoria, subcategoria, categories) ?? undefined;
    },
  });
}
