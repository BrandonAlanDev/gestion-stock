"use client";

import { useQuery } from "@tanstack/react-query";
import { getSizeTypes } from "@/actions/sizes";

export function useSizeTypes() {
  return useQuery({
    queryKey: ["sizeTypes"],
    queryFn: async () => {
      const data = await getSizeTypes();
      if (!data) throw new Error("Error al cargar talles");
      return data;
    },
    staleTime: Infinity,
  });
}