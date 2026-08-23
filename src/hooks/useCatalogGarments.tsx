"use client";
import { useQuery } from "@tanstack/react-query";
import { getGarmentsByNames } from "@/actions/garments";

type ResultadoCatalogo = {
  success: boolean;
  data: unknown[];
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
  return useQuery<ResultadoCatalogo>({
    queryKey: ["catalogProducts", { page, limit, categoria, search, subcategoria }],
    queryFn: async () => {
      const resultado = await getGarmentsByNames(page, limit, categoria, search, subcategoria);
      if ("error" in resultado) {
        return { success: false, data: [], total: 0, page, totalPages: 1 };
      }
      return resultado;
    },
    initialData: initialData as ResultadoCatalogo | undefined,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
