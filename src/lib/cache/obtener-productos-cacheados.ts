import { unstable_cache } from "next/cache";
import { obtenerPrendasPaginadas } from "@/lib/services/prendas/obtener-prendas-paginadas";
import { conContextoTenantRuntime } from "@/lib/tenants/contexto-tenant-runtime";

export async function obtenerProductosCacheados(
  tenantId: string,
  page: number,
  limit: number,
  categoryId?: string,
  search?: string,
  subCategoryId?: string
) {
  const paginaSegura = Math.min(100, Math.max(1, Math.trunc(page) || 1));
  const limiteSeguro = Math.min(50, Math.max(1, Math.trunc(limit) || 20));
  const busqueda = search?.trim();

  if (busqueda) {
    return conContextoTenantRuntime(tenantId, () => obtenerPrendasPaginadas(
        tenantId,
        paginaSegura,
        limiteSeguro,
        categoryId,
        busqueda,
        subCategoryId
      ));
  }

  return conContextoTenantRuntime(tenantId, () => unstable_cache(
    () =>
      obtenerPrendasPaginadas(
        tenantId,
        paginaSegura,
        limiteSeguro,
        categoryId,
        undefined,
        subCategoryId
      ),
    [
      `tenant:${tenantId}:products`,
      String(paginaSegura),
      String(limiteSeguro),
      categoryId ?? "",
      subCategoryId ?? "",
    ],
    { revalidate: 300, tags: [`tenant:${tenantId}:products`] }
  )());
}
