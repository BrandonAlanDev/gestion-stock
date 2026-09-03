"use client";

import { useQuery } from "@tanstack/react-query";
import { getColors } from "@/actions/colors";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";

export function useColors() {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["tenant", tenantId, "colors"],
    queryFn: async () => {
      const data = await getColors();
      if (!data) throw new Error("Error al cargar colores");
      return data;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
