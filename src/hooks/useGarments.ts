"use client";

import { useQuery } from "@tanstack/react-query";
import { obtenerPrendas } from "@/actions/prendas/obtener-prendas";

export function useGarments(
  page: number,
  limit: number,
  categoryId?: string,
  search?: string
) {

  return useQuery({
    queryKey: [
      "garments",
      { page, limit, categoryId, search },
    ],
    queryFn: async () => {
      const res = await obtenerPrendas(page, limit, categoryId, search);
      if (res.error) throw new Error(res.error);
      return res; // { success, data, total, page, totalPages }
    },
    placeholderData: (previousData) => previousData, // mantiene datos previos al cambiar de página
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
