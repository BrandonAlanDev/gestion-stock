"use client";

import { useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CategoryContentClient from "@/components/categories/view/CategoryContentClient";
import Pagination from "@/components/ui/pagination";
import { useCatalogCategories } from "@/hooks/useCatalogCategories";
import { useCatalogGarments, type ResultadoCatalogo } from "@/hooks/useCatalogGarments";
import { guardarCategoriasCatalogo, guardarPaginaCatalogo } from "@/lib/productos/cache-cliente";
import type { CategoriaCatalogo } from "@/types/productos/catalogo-publico";

export default function PaginaCategoriaClient({
  tenantId,
  categories,
  category,
  categoriesObtenidoEn,
  initialGarments,
  initialPage,
  initialLimit,
  initialSubcategory,
  basePath,
}: {
  tenantId: string;
  categories: CategoriaCatalogo[];
  category: CategoriaCatalogo;
  categoriesObtenidoEn: number;
  initialGarments: ResultadoCatalogo;
  initialPage: number;
  initialLimit: number;
  initialSubcategory?: string;
  basePath: string;
}) {
  const searchParams = useSearchParams();
  const currentPage = Math.min(100, Math.max(1, Math.trunc(Number(searchParams.get("page"))) || 1));
  const limit = Math.min(50, Math.max(1, Math.trunc(Number(searchParams.get("limit"))) || 12));
  const subcategoryParam = searchParams.get("subcategory");

  const { data: categoriesData, dataUpdatedAt: categoriasActualizadasEn } = useCatalogCategories(
    tenantId, categories, categoriesObtenidoEn
  );
  const currentCategory = categoriesData?.find((item) => item.id === category.id) ?? category;
  const subcategory = currentCategory.subCategories.find((item) => item.id === subcategoryParam)?.id;
  const { data: garmentsData, dataUpdatedAt, isFetching, isPlaceholderData } = useCatalogGarments(
    tenantId,
    currentPage,
    limit,
    category.name,
    undefined,
    subcategory,
    [currentCategory],
    currentPage === initialPage && limit === initialLimit && subcategory === initialSubcategory
      ? initialGarments
      : undefined,
    categoriasActualizadasEn
  );

  useEffect(() => {
    guardarCategoriasCatalogo(tenantId, categories, categoriesObtenidoEn);
  }, [tenantId, categories, categoriesObtenidoEn]);

  useEffect(() => {
    if (garmentsData?.success && dataUpdatedAt > 0 && !isPlaceholderData && garmentsData.page === currentPage) {
      guardarPaginaCatalogo(
        tenantId, currentPage, limit, category.name, subcategory,
        garmentsData.data, garmentsData.total, garmentsData.obtenidoEn ?? dataUpdatedAt
      );
    }
  }, [tenantId, currentPage, limit, category.name, subcategory, garmentsData, dataUpdatedAt, isPlaceholderData]);

  const updateParams = useCallback((nuevos: Record<string, string | undefined>) => {
    const parametros = new URLSearchParams(searchParams.toString());
    for (const [clave, valor] of Object.entries(nuevos)) {
      if (valor) parametros.set(clave, valor);
      else parametros.delete(clave);
    }
    const consulta = parametros.toString();
    const destino = consulta ? `${basePath}?${consulta}` : basePath;
    if (`${window.location.pathname}${window.location.search}` !== destino) {
      window.history.pushState(null, "", destino);
    }
  }, [searchParams, basePath]);

  const handleFilterChange = (subId?: string) => updateParams({ subcategory: subId, page: undefined });
  const handlePageChange = (page: number) => updateParams({ page: page > 1 ? String(page) : undefined });

  return (
    <>
      <CategoryContentClient
        subCategories={currentCategory.subCategories}
        garments={garmentsData?.data ?? []}
        selectedSubId={subcategory ?? "all"}
        onFilterChange={handleFilterChange}
        loading={isFetching && !garmentsData}
      />
      {garmentsData?.success && (
        <Pagination
          currentPage={currentPage}
          totalPages={garmentsData.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
