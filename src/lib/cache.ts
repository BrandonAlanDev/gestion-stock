import { unstable_cache } from "next/cache";
import * as garmentService from "./services/garment-service";
import * as categoryService from "./services/category-service";
import * as providerService from "./services/provider-service";
import * as sizeService from "./services/size-service";
import * as colorService from "./services/color-service";
import { prisma } from "./prisma";

// ── PAGE CONFIG ──────────────────────────────────
export const getCachedPageConfig = unstable_cache(
  async () => prisma.pageConfig.findUnique({ where: { id: "1" } }),
  ["page-config"],
  { revalidate: 3600 }
);

// ── PRODUCTOS ────────────────────────────────────
export const getCachedProducts = (
  page: number,
  limit: number,
  categoryId?: string,
  search?: string,
  subCategoryId?: string
) =>
  unstable_cache(
    () => garmentService.getGarmentsPaginated(page, limit, categoryId, search, subCategoryId),
    [
      `products-pg-${page}-lim-${limit}-cat-${categoryId || "all"}-q-${search || ""}-sub-${subCategoryId || "all"}`,
    ],
    { revalidate: 60, tags: ["products"] }
  );

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