"use client";

import { useQuery } from "@tanstack/react-query";
import { getGarmentById } from "@/actions/garments";

export function useProductDetail(id: string, initialData?: any) {
  return useQuery({
    queryKey: ["productDetail", id],
    queryFn: async () => {
      const product = await getGarmentById(id);
      if (!product || !product.active) {
        throw new Error("Producto no encontrado");
      }
      return product;
    },
    initialData,
    staleTime: 10 * 60 * 1000, // 10 minutos
    placeholderData: (previousData) => previousData,
  });
}