import { unstable_cache } from "next/cache";
import * as servicioPrendas from "@/lib/services/garment-service";

export const obtenerProductoCacheadoPorId = (tenantId: string, id: string) => async () => {
  return unstable_cache(
    () => servicioPrendas.getGarmentById(tenantId, id),
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
