"use client";

import { useQuery } from "@tanstack/react-query";
import { obtenerPrendaPorId } from "@/actions/prendas/obtener-prenda-por-id";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";

type ResultadoDetalleProducto = Awaited<ReturnType<typeof obtenerPrendaPorId>>;

export function useProductDetail(
  id: string,
  initialData?: ResultadoDetalleProducto
) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["tenant", tenantId, "productDetail", id],
    queryFn: async () => {
      const product = await obtenerPrendaPorId(id);
      if (!product || !product.active) {
        throw new Error("Producto no encontrado");
      }
      return product;
    },
    initialData,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}
