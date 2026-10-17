import { unstable_cache } from "next/cache";
import { obtenerCategoriasCompletas } from "@/lib/services/categorias/obtener-categorias-completas";

export async function obtenerCategoriasCacheadas(tenantId: string) {
  return unstable_cache(
    () => obtenerCategoriasCompletas(tenantId),
    [`categories`],
    { revalidate: 3600, tags: [`categories`] }
  )();
}
