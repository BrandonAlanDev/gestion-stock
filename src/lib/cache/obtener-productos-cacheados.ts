import { unstable_cache } from "next/cache";
import { obtenerPrendasPaginadas } from "@/lib/services/prendas/obtener-prendas-paginadas";

const MAX_PRODUCTOS_CACHEADOS_POR_TENANT = 100;
const LIMITE_CATALOGO_CACHEADO = 20;

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

  // Cada tenant genera como máximo cinco entradas para el catálogo general.
  if (
    busqueda ||
    categoryId ||
    subCategoryId ||
    limiteSeguro !== LIMITE_CATALOGO_CACHEADO ||
    paginaSegura * limiteSeguro > MAX_PRODUCTOS_CACHEADOS_POR_TENANT
  ) {
    return obtenerPrendasPaginadas(
      tenantId,
      paginaSegura,
      limiteSeguro,
      categoryId,
      busqueda,
      subCategoryId
    );
  }

  return unstable_cache(
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
      `tenant:${tenantId}`,
      `public-products:v3`,
      String(paginaSegura),
    ],
    { revalidate: 300, tags: [`tenant:${tenantId}:products`] }
  )();
}
