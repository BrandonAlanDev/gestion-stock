import { unstable_cache } from "next/cache";
import * as servicioColores from "@/lib/services/color-service";

export async function obtenerColoresCacheados(tenantId: string) {
  return unstable_cache(
    () => servicioColores.getColors(tenantId),
    [`colors`],
    { revalidate: 3600, tags: [`colors`] }
  )();
}
