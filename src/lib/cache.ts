import { unstable_cache } from "next/cache";
import * as garmentService from "./services/garment-service";
import * as categoryService from "./services/category-service";
import * as providerService from "./services/provider-service";
import * as sizeService from "./services/size-service";
import * as colorService from "./services/color-service";
import { prisma } from "./prisma";

// ── PAGE CONFIG ──────────────────────────────────
export const getCachedPageConfig = unstable_cache(
  async () => prisma.pageConfig.findFirst(),
  ["page-config"],
  { revalidate: 3600 }
);

// ── PRODUCTOS (función directa, sin caché por closure) ──
export async function getCachedProducts(
  page: number,
  limit: number,
  categoryId?: string,
  search?: string,
  subCategoryId?: string
) {
  return garmentService.getGarmentsPaginated(page, limit, categoryId, search, subCategoryId);
}

// ── CATEGORÍAS (con subcategorías y talles) ──────
export const getCachedCategories = unstable_cache(
  categoryService.getCategoriesFull,
  ["all-categories"],
  { revalidate: 3600, tags: ["categories"] }
);

// ── PROVEEDORES ─────────────────────────────────
export const getCachedProviders = unstable_cache(
  providerService.getProviders,
  ["all-providers"],
  { revalidate: 3600, tags: ["providers"] }
);

// ── TALLES ──────────────────────────────────────
export const getCachedSizeTypes = unstable_cache(
  sizeService.getSizeTypes,
  ["all-size-types"],
  { revalidate: 3600, tags: ["sizeTypes"] }
);

// ── COLORES ─────────────────────────────────────
export const getCachedColors = unstable_cache(
  colorService.getColors,
  ["all-colors"],
  { revalidate: 3600, tags: ["colors"] }
);