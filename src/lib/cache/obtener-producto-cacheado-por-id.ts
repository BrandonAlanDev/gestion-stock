import { unstable_cache } from "next/cache";
import { obtenerPrendaPorId } from "@/lib/services/prendas/obtener-prenda-por-id";

export const obtenerProductoCacheadoPorId = (tenantId: string, id: string) => async () => {
  return unstable_cache(
    () => obtenerPrendaPorId(tenantId, id),
    [`product:${id}`],
    {
      revalidate: 300,
      tags: [
        `products`,
        `product:${id}`,
      ],
    }
  )();
};
