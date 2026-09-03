"use client";
import { useQuery } from "@tanstack/react-query";
import { getGarmentsByNames } from "@/actions/garments";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";
import type { ProductoCatalogo } from "@/types/productos/catalogo-publico";

type ResultadoCatalogo = {
  success: boolean;
  data: ProductoCatalogo[];
  total: number;
  page: number;
  totalPages: number;
};

export function useCatalogGarments(
  page: number,
  limit: number,
  categoria?: string,
  search?: string,
  subcategoria?: string,
  initialData?: unknown
) {
  const tenantId = useTenantId();

  return useQuery<ResultadoCatalogo>({
    queryKey: [
      "tenant",
      tenantId,
      "catalogProducts",
      { page, limit, categoria, search, subcategoria },
    ],
    queryFn: async () => {
      const resultado = await getGarmentsByNames(page, limit, categoria, search, subcategoria);
      if ("error" in resultado) {
        return { success: false, data: [], total: 0, page, totalPages: 1 };
      }
      return resultado;
    },
    initialData: initialData as ResultadoCatalogo | undefined,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
