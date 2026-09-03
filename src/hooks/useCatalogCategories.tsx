"use client";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/actions/categories";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";

type ResultadoCategorias = Awaited<ReturnType<typeof getCategories>>;

export function useCatalogCategories(initialData?: unknown) {
  const tenantId = useTenantId();

  return useQuery<ResultadoCategorias>({
    queryKey: ["tenant", tenantId, "catalogCategories"],
    queryFn: async () => {
      const data = await getCategories();
      if (!data) throw new Error("Error al cargar categorías");
      return data;
    },
    initialData: initialData as ResultadoCategorias | undefined,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
