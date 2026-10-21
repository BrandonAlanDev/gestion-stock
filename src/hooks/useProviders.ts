"use client";

import { useQuery } from "@tanstack/react-query";
import { getProviders } from "@/actions/proveedores/obtener-proveedores";

export function useProviders(initialData?: Awaited<ReturnType<typeof getProviders>>) {

  return useQuery({
    queryKey: ["providers"],
    initialData,
    queryFn: async () => {
      const data = await getProviders();
      if (!data) throw new Error("Error al cargar proveedores");
      return data;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
