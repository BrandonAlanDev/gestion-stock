"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/categories";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";

export function useCategories() {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["tenant", tenantId, "categories"],
    queryFn: async () => {
      const data = await getCategories();
      if (!data) throw new Error("Error al cargar categorías");
      return data;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
