"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/categorias/obtener-categorias";

export function useCategories() {

  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await getCategories();
      if (!data) throw new Error("Error al cargar categorías");
      return data;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
