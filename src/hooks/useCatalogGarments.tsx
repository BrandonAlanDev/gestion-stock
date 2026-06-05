"use client";
import { useQuery } from "@tanstack/react-query";
import { getGarmentsByNames } from "@/actions/garments";

export function useCatalogGarments(
  page: number,
  limit: number,
  categoria?: string,
  search?: string,
  subcategoria?: string,
  initialData?: any
) {
  return useQuery({
    queryKey: ["catalogProducts", { page, limit, categoria, search, subcategoria }],
    queryFn: () => getGarmentsByNames(page, limit, categoria, search, subcategoria),
    initialData,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}