"use client";

import { useQuery } from "@tanstack/react-query";
import { getGarments } from "@/actions/garments";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";

export function useGarments(
  page: number,
  limit: number,
  categoryId?: string,
  search?: string
) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: [
      "tenant",
      tenantId,
      "garments",
      { page, limit, categoryId, search },
    ],
    queryFn: async () => {
      const res = await getGarments(page, limit, categoryId, search);
      if (res.error) throw new Error(res.error);
      return res; // { success, data, total, page, totalPages }
    },
    placeholderData: (previousData) => previousData, // mantiene datos previos al cambiar de página
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
