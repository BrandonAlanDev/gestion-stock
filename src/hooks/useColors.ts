"use client";

import { useQuery } from "@tanstack/react-query";
import { getColors } from "@/actions/colors";

export function useColors() {
  return useQuery({
    queryKey: ["colors"],
    queryFn: async () => {
      const data = await getColors();
      if (!data) throw new Error("Error al cargar colores");
      return data;
    },
    staleTime: Infinity,
  });
}