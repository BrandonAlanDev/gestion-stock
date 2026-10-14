import { unstable_cache } from "next/cache";
import * as servicioCategorias from "@/lib/services/category-service";

export async function obtenerCategoriasCacheadas(tenantId: string) {
  return unstable_cache(
    () => servicioCategorias.getCategoriesFull(tenantId),
    [`tenant:${tenantId}:categories`],
    { revalidate: 3600, tags: [`tenant:${tenantId}:categories`] }
  )();
}
