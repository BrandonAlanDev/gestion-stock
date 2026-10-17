"use client";

import { useQuery } from "@tanstack/react-query";
import { getColors } from "@/actions/colores/obtener-colores";

export function useColors() {

  return useQuery({
    queryKey: ["colors"],
    queryFn: async () => {
      const data = await getColors();
      if (!data) throw new Error("Error al cargar colores");
      return data;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
