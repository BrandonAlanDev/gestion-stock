"use client";

import { useQuery } from "@tanstack/react-query";
import { getProviders } from "@/actions/providers";

export function useProviders() {
  return useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const data = await getProviders();
      if (!data) throw new Error("Error al cargar proveedores");
      return data;
    },
    staleTime: Infinity,
  });
}