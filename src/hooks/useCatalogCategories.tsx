"use client";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/categories";

type ResultadoCategorias = Awaited<ReturnType<typeof getCategories>>;

export function useCatalogCategories(initialData?: unknown) {
  return useQuery<ResultadoCategorias>({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await getCategories();
      if (!data) throw new Error("Error al cargar categorías");
      return data;
    },
    initialData: initialData as ResultadoCategorias | undefined,
    staleTime: 10 * 60 * 1000, //Tiempo que se guarda en cache en cliente (10 minutos)
  });
}
