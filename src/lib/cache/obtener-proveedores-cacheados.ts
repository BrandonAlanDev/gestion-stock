import { unstable_cache } from "next/cache";
import { obtenerProveedores } from "@/lib/services/proveedores/obtener-proveedores";
import { conContextoTenantRuntime } from "@/lib/tenants/contexto-tenant-runtime";

export async function obtenerProveedoresCacheados(tenantId: string) {
  return conContextoTenantRuntime(tenantId, () => unstable_cache(
    () => obtenerProveedores(tenantId),
    [`tenant:${tenantId}:providers`],
    { revalidate: 3600, tags: [`tenant:${tenantId}:providers`] }
  )());
}
