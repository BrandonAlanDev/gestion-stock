import { unstable_cache } from "next/cache";
import { obtenerCarruseles } from "@/lib/services/carruseles/obtener-carruseles";

export async function obtenerCarruselesCacheados(tenantId: string) {
  return unstable_cache(
    () => obtenerCarruseles(tenantId, undefined, true),
    [`tenant:${tenantId}:carousels`],
    { revalidate: 3600, tags: [`carousels`] }
  )();
}
