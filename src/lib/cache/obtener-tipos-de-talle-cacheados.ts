import { unstable_cache } from "next/cache";
import * as servicioTalles from "@/lib/services/size-service";
import { conContextoTenantRuntime } from "@/lib/tenants/contexto-tenant-runtime";

export async function obtenerTiposTalleCacheados(tenantId: string) {
  return conContextoTenantRuntime(tenantId, () => unstable_cache(
    () => servicioTalles.getSizeTypes(tenantId),
    [`tenant:${tenantId}:sizeTypes`],
    { revalidate: 3600, tags: [`tenant:${tenantId}:sizeTypes`] }
  )());
}
