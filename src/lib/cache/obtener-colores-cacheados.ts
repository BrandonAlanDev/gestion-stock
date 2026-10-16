import { unstable_cache } from "next/cache";
import * as servicioColores from "@/lib/services/color-service";
import { conContextoTenantRuntime } from "@/lib/tenants/contexto-tenant-runtime";

export async function obtenerColoresCacheados(tenantId: string) {
  return conContextoTenantRuntime(tenantId, () => unstable_cache(
    () => servicioColores.getColors(tenantId),
    [`tenant:${tenantId}:colors`],
    { revalidate: 3600, tags: [`tenant:${tenantId}:colors`] }
  )());
}
