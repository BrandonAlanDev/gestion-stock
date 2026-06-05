"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/categories";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await getCategories();
      if (!data) throw new Error("Error al cargar categorías");
      return data;
    },
    staleTime: Infinity, // solo se invalidan manualmente
  });
}