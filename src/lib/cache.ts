import { unstable_cache } from "next/cache";
import * as garmentService from "@/lib/services/garment-service";
import * as categoryService from "@/lib/services/category-service";
import { obtenerProveedores } from "@/lib/services/proveedores/obtener-proveedores";
import * as sizeService from "@/lib/services/size-service";
import * as colorService from "@/lib/services/color-service";
import { obtenerCarruseles } from "@/lib/services/carruseles/obtener-carruseles";

// ── PRODUCTOS (cache real de servidor, tag "products") ──
export async function getCachedProducts(
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
    return garmentService.getGarmentsPaginated(
      tenantId,
      paginaSegura,
      limiteSeguro,
      categoryId,
      busqueda,
      subCategoryId
    );
  }
  return unstable_cache(
    () => garmentService.getGarmentsPaginated(tenantId, paginaSegura, limiteSeguro, categoryId, undefined, subCategoryId),
    [`tenant:${tenantId}:products`, String(paginaSegura), String(limiteSeguro), categoryId ?? "", subCategoryId ?? ""],
    { revalidate: 300, tags: [`tenant:${tenantId}:products`] }
  )();
}

// ── PRODUCTO INDIVIDUAL (cacheado por ID) ──
export const getCachedProductById = (tenantId: string, id: string) => async () => {
  return unstable_cache(
    () => garmentService.getGarmentById(tenantId, id),
    [`tenant:${tenantId}:product:${id}`],
    { revalidate: 300, tags: [`tenant:${tenantId}:product:${id}`] }
  )();
};

// ── CATEGORÍAS (con subcategorías y talles) ──────
export async function getCachedCategories(tenantId: string) {
  return unstable_cache(
    () => categoryService.getCategoriesFull(tenantId),
    [`tenant:${tenantId}:categories`],
    { revalidate: 3600, tags: [`tenant:${tenantId}:categories`] }
  )();
}

// ── PROVEEDORES ─────────────────────────────────
export async function getCachedProviders(tenantId: string) {
  return unstable_cache(
    () => obtenerProveedores(tenantId),
    [`tenant:${tenantId}:providers`],
    { revalidate: 3600, tags: [`tenant:${tenantId}:providers`] }
  )();
}

// ── TALLES ──────────────────────────────────────
export async function getCachedSizeTypes(tenantId: string) {
  return unstable_cache(
    () => sizeService.getSizeTypes(tenantId),
    [`tenant:${tenantId}:sizeTypes`],
    { revalidate: 3600, tags: [`tenant:${tenantId}:sizeTypes`] }
  )();
}

// ── COLORES ─────────────────────────────────────
export async function getCachedColors(tenantId: string) {
  return unstable_cache(
    () => colorService.getColors(tenantId),
    [`tenant:${tenantId}:colors`],
    { revalidate: 3600, tags: [`tenant:${tenantId}:colors`] }
  )();
}

// ─── CARRUSELES ────────────────────────────────────────────────────
export async function getCachedCarousels(tenantId: string) {
  return unstable_cache(
    () => obtenerCarruseles(tenantId, undefined, true),
    [`tenant:${tenantId}:carousels`],
    { revalidate: 3600, tags: [`tenant:${tenantId}:carousels`] }
  )();
}
