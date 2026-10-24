"use client";
import { useQuery } from "@tanstack/react-query";
import { obtenerPrendasPorNombres } from "@/actions/prendas/obtener-prendas-por-nombres";
import type { ProductoCatalogo } from "@/types/productos/catalogo-publico";
import { leerPaginaCatalogo } from "@/lib/productos/cache-cliente";

type ResultadoCatalogo = {
  success: boolean;
  data: ProductoCatalogo[];
  total: number;
  page: number;
  totalPages: number;
  obtenidoEn?: number;
};

export function useCatalogGarments(
  tenantId: string,
  page: number,
  limit: number,
  categoria?: string,
  search?: string,
  subcategoria?: string,
  initialData?: ResultadoCatalogo
) {

  return useQuery<ResultadoCatalogo>({
    queryKey: [
      "catalogProducts",
      { tenantId, page, limit, categoria, search, subcategoria },
    ],
    queryFn: async () => {
      const resultado = await obtenerPrendasPorNombres(page, limit, categoria, search, subcategoria);
      if ("error" in resultado) {
        return { success: false, data: [], total: 0, page, totalPages: 1 };
      }
      return resultado;
    },
    initialData,
    initialDataUpdatedAt: initialData?.obtenidoEn,
    staleTime: 15 * 1000,
    gcTime: 0,
    placeholderData: () => {
      if (typeof window === "undefined") return undefined;
      const vista = leerPaginaCatalogo(tenantId, page, categoria, subcategoria);
      return vista ? { success: true, data: vista.productos, total: 0, page, totalPages: vista.paginasTotales } : undefined;
    },
  });
}
