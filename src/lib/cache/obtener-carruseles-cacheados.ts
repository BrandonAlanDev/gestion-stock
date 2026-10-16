import { unstable_cache } from "next/cache";
import { obtenerCarruseles } from "@/lib/services/carruseles/obtener-carruseles";
import { conContextoTenantRuntime } from "@/lib/tenants/contexto-tenant-runtime";

export async function obtenerCarruselesCacheados(tenantId: string) {
  return conContextoTenantRuntime(tenantId, () => unstable_cache(
    () => obtenerCarruseles(tenantId, undefined, true),
    [`tenant:${tenantId}:carousels`],
    { revalidate: 3600, tags: [`tenant:${tenantId}:carousels`] }
  )());
}
