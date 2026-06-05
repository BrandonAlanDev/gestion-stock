"use client";

import { useCart } from "@/context/CartContext";
import ProductsPage from "@/components/products/views/ProductsPage";
import { useCatalogGarments } from "@/hooks/useCatalogGarments";
import { useCatalogCategories } from "@/hooks/useCatalogCategories";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";

export default function CatalogoClient() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const limit = 20;

  const currentPage = Number(searchParams.get("page")) || 1;
  const categoria = searchParams.get("categoria") || undefined;
  const subcategoria = searchParams.get("subcategoria") || undefined;

  const { data: garmentsData, isFetching } = useCatalogGarments(
    currentPage,
    limit,
    categoria,
    undefined,
    subcategoria
  );
  const { data: categoriesData } = useCatalogCategories();

  const garments = garmentsData?.data || [];
  const categories = categoriesData || [];
  const totalPages = garmentsData?.totalPages || 1;

  // Actualizar URL sin recargar la página (para que el hook se actualice)
  const updateParams = useCallback(
    (newParams: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (!value || value === "Todos") params.delete(key);
        else params.set(key, value);
      });
      router.replace(`/productos?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
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
      {isFetching && (
        <div className="fixed inset-0 z-50 bg-white/70 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        </div>
      )}
      <ProductsPage
        garments={garments}
        categories={categories}
        addToCart={addToCart}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}