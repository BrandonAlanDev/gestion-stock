"use client";

import { useQuery } from "@tanstack/react-query";
import { getProviders } from "@/actions/proveedores/obtener-proveedores";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";

export function useProviders() {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["tenant", tenantId, "providers"],
    queryFn: async () => {
      const data = await getProviders();
      if (!data) throw new Error("Error al cargar proveedores");
      return data;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
