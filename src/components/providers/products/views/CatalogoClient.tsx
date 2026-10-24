"use client";

import ProductsPage from "@/components/providers/products/views/ProductsPage";
import type {
  CategoriaCatalogo,
  ProductoCatalogo,
} from "@/types/productos/catalogo-publico";
import { useCatalogGarments } from "@/hooks/useCatalogGarments";
import { useCatalogCategories } from "@/hooks/useCatalogCategories";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { SkeletonTienda } from "@/components/ui/skeleton-vistas";
import { guardarPaginaCatalogo } from "@/lib/productos/cache-cliente";

export default function CatalogoClient({
  tenantId,
  initialCategoria,
  initialSubcategoria,
  initialGarments,
  initialCategories,
}: {
  tenantId: string;
  initialCategoria?: string;
  initialSubcategoria?: string;
  initialGarments?: {
    success: boolean;
    data: ProductoCatalogo[];
    total: number;
    page: number;
    totalPages: number;
    obtenidoEn: number;
  };
  initialCategories?: CategoriaCatalogo[];
}) {
  const searchParams = useSearchParams();
  const limit = 20;

  const currentPage = Math.min(100, Math.max(1, Math.trunc(Number(searchParams.get("page"))) || 1));
  const categoria = searchParams.get("categoria") || undefined;
  const subcategoria = searchParams.get("subcategoria") || undefined;

  const { data: garmentsData, dataUpdatedAt, isFetching, isPlaceholderData } = useCatalogGarments(
    tenantId,
    currentPage,
    limit,
    categoria,
    undefined,
    subcategoria,
    currentPage === initialGarments?.page && categoria === initialCategoria && subcategoria === initialSubcategoria
      ? initialGarments
      : undefined
  );
  const { data: categoriesData } = useCatalogCategories(tenantId, initialCategories);

  const garments = garmentsData?.data || [];
  const categories = categoriesData || [];
  const totalPages = garmentsData?.totalPages || 1;

  useEffect(() => {
    if (garmentsData?.success && dataUpdatedAt > 0 && !isPlaceholderData && garmentsData.page === currentPage) {
      guardarPaginaCatalogo(tenantId, currentPage, categoria, subcategoria, garmentsData.data, garmentsData.totalPages, dataUpdatedAt);
    }
  }, [tenantId, currentPage, categoria, subcategoria, garmentsData, dataUpdatedAt, isPlaceholderData]);

  // Actualizar URL sin recargar la página (para que el hook se actualice)
  const updateParams = useCallback(
    (newParams: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (!value || value === "Todos") params.delete(key);
        else params.set(key, value);
      });
      const query = params.toString();
      window.history.replaceState(null, "", query ? `/productos?${query}` : "/productos");
    },
    [searchParams]
  );

  const handlePageChange = (page: number) =>
    updateParams({ page: page > 1 ? String(page) : undefined });

  const handleFilterChange = (catName?: string, subName?: string) =>
    updateParams({
      categoria: catName && catName !== "Todos" ? catName : undefined,
      subcategoria: subName && subName !== "Todos" ? subName : undefined,
      page: undefined,
    });

  if (isFetching && garments.length === 0) {
    return <SkeletonTienda />;
  }

  return (
    <div className="relative">
      <ProductsPage
        garments={garments}
        categories={categories}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
