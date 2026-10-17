import { unstable_cache } from "next/cache";
import * as servicioTalles from "@/lib/services/size-service";

export async function obtenerTiposTalleCacheados(tenantId: string) {
  return unstable_cache(
    () => servicioTalles.getSizeTypes(tenantId),
    [`sizeTypes`],
    { revalidate: 3600, tags: [`sizeTypes`] }
  )();
}
