import { unstable_cache } from "next/cache";
import { obtenerPrendaPorId } from "@/lib/services/prendas/obtener-prenda-por-id";

export const obtenerProductoCacheadoPorId = (tenantId: string, id: string) => async () => {
  return unstable_cache(
    () => obtenerPrendaPorId(tenantId, id),
    [`tenant:${tenantId}:product:${id}`],
    {
      revalidate: 300,
      tags: [
        `tenant:${tenantId}:products`,
        `tenant:${tenantId}:product:${id}`,
      ],
    }
  )();
};
