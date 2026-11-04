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
import { guardarCategoriasCatalogo, guardarPaginaCatalogo } from "@/lib/productos/cache-cliente";

export default function CatalogoClient({
  tenantId,
  initialCategoria,
  initialSubcategoria,
  initialGarments,
  initialCategories,
  initialCategoriesObtenidoEn,
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
  initialCategoriesObtenidoEn?: number;
}) {
  const searchParams = useSearchParams();
  const limit = 20;

  const currentPage = Math.min(100, Math.max(1, Math.trunc(Number(searchParams.get("page"))) || 1));
  const categoria = searchParams.get("categoria") || undefined;
  const subcategoria = searchParams.get("subcategoria") || undefined;

  const { data: categoriesData, dataUpdatedAt: categoriasActualizadasEn } = useCatalogCategories(
    tenantId, initialCategories, initialCategoriesObtenidoEn
  );
  const { data: garmentsData, dataUpdatedAt, isFetching } = useCatalogGarments(
    tenantId,
    currentPage,
    limit,
    categoria,
    undefined,
    subcategoria,
    categoriesData,
    currentPage === initialGarments?.page && categoria === initialCategoria && subcategoria === initialSubcategoria
      ? initialGarments
      : undefined,
    categoriasActualizadasEn
  );

  const garments = garmentsData?.data || [];
  const categories = categoriesData || [];
  const totalPages = garmentsData?.totalPages || 1;

  useEffect(() => {
    if (initialCategories && initialCategoriesObtenidoEn) {
      guardarCategoriasCatalogo(tenantId, initialCategories, initialCategoriesObtenidoEn);
    }
  }, [tenantId, initialCategories, initialCategoriesObtenidoEn]);

  useEffect(() => {
    if (garmentsData?.success && dataUpdatedAt > 0 && garmentsData.page === currentPage) {
      guardarPaginaCatalogo(
        tenantId, currentPage, limit, categoria, subcategoria,
        garmentsData.data, garmentsData.total, garmentsData.obtenidoEn ?? dataUpdatedAt
      );
    }
  }, [tenantId, currentPage, categoria, subcategoria, garmentsData, dataUpdatedAt]);

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

  return (
    <div className="relative">
      <ProductsPage
        garments={garments}
        categories={categories}
        currentPage={currentPage}
        totalPages={totalPages}
        loading={isFetching && !garmentsData}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
