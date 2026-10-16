import { unstable_cache } from "next/cache";
import { obtenerCategoriasCompletas } from "@/lib/services/categorias/obtener-categorias-completas";
import { conContextoTenantRuntime } from "@/lib/tenants/contexto-tenant-runtime";

export async function obtenerCategoriasCacheadas(tenantId: string) {
  return conContextoTenantRuntime(tenantId, () => unstable_cache(
    () => obtenerCategoriasCompletas(tenantId),
    [`tenant:${tenantId}:categories`],
    { revalidate: 3600, tags: [`tenant:${tenantId}:categories`] }
  )());
}
