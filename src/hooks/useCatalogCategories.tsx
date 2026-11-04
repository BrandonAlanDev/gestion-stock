"use client";
import { useQuery } from "@tanstack/react-query";
import { obtenerCategoriasCatalogoPublicas } from "@/actions/categorias/obtener-categorias-catalogo";
import { guardarCategoriasCatalogo, leerCategoriasCatalogo } from "@/lib/productos/cache-cliente";
import type { CategoriaCatalogo } from "@/types/productos/catalogo-publico";

export function useCatalogCategories(tenantId: string, initialData?: CategoriaCatalogo[], obtenidoEn?: number) {

  return useQuery<CategoriaCatalogo[]>({
    queryKey: ["catalogCategories", tenantId],
    queryFn: async () => {
      const local = leerCategoriasCatalogo(tenantId);
      if (local) return local.datos;
      const data = await obtenerCategoriasCatalogoPublicas();
      guardarCategoriasCatalogo(tenantId, data);
      return data;
    },
    initialData,
    initialDataUpdatedAt: obtenidoEn,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
