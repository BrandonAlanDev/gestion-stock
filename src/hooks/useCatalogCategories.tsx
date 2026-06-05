"use client";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/categories";

export function useCatalogCategories(initialData?: any) {
  return useQuery({
    queryKey: ["catalogCategories"],
    queryFn: async () => {
      const data = await getCategories();
      if (!data) throw new Error("Error al cargar categorías");
      return data;
    },
    initialData,
    staleTime: 10 * 60 * 1000, //Tiempo que se guarda en cache en cliente (10 minutos)
  });
}