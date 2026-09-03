"use client";

import { useQuery } from "@tanstack/react-query";
import { getSizeTypes } from "@/actions/sizes";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";

export function useSizeTypes() {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["tenant", tenantId, "sizeTypes"],
    queryFn: async () => {
      const data = await getSizeTypes();
      if (!data) throw new Error("Error al cargar talles");
      return data;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
