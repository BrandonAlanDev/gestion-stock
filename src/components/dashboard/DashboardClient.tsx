"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGarments } from "@/hooks/useGarments";
import { useCategories } from "@/hooks/useCategories";
import { useSizeTypes } from "@/hooks/useSizeTypes";
import { useProviders } from "@/hooks/useProviders";
import { useColors } from "@/hooks/useColors";
import Search from "@/components/search/Search";
import CategoryFilter from "@/components/categories/filters/CategoryFilter";
import MovementModal from "@/components/movements/MovementModal";
import ProductModal from "@/components/products/modals/ProductModal";
import QuickViewTable from "@/components/products/modals/QuickViewTable";

export default function DashboardClient() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const limit = 20;

  // Queries
  const { data: garmentsData, isLoading, isError, error } = useGarments(page, limit, category || undefined, search || undefined);
  const { data: categories } = useCategories();
  const { data: sizeTypes } = useSizeTypes();
  const { data: providers } = useProviders();
  const { data: colors } = useColors();

  // Datos para la tabla
  const garments = garmentsData?.data || [];
  const totalPages = garmentsData?.totalPages || 1;

  // Handlers de cambio de filtros (resetean página a 1)
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (catId: string) => {
    setCategory(catId);
    setPage(1);
  };

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: ["garments"] });
  };

  return (
    <div className="p-8 min-h-screen pt-24" style={{ background: "#f0fafa", color: "#0d2b2e" }}>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3" style={{ color: "#083d42" }}>
            <span className="w-2 h-8 rounded-full inline-block" style={{ background: "#0d5c63" }} />
            Gestión de Inventario
          </h1>
          <p className="text-[10px] font-black uppercase mt-1 ml-5" style={{ color: "#4a7c80", letterSpacing: "0.4em" }}>
            Control de Stock y Operaciones
          </p>
        </div>
        <div className="flex flex-row flex-wrap gap-3">
          <MovementModal garments={garments} onSuccess={invalidateProducts} />
          <ProductModal
            categories={categories || []}
            sizes={sizeTypes || []}
            providers={providers || []}
            colors={colors || []}
            onSuccess={invalidateProducts}
          />
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Search initialValue={search} onChange={handleSearchChange} className="w-full" />
        </div>
        <div className="w-full md:w-72">
          <CategoryFilter categories={categories || []} value={category} onChange={handleCategoryChange} />
        </div>
      </div>

      {/* TABLA */}
      {isLoading && (
        <div className="text-center py-12 text-[#4a7c80]">Cargando productos...</div>
      )}
      {isError && (
        <div className="text-center py-12 text-red-500">Error: {(error as Error).message}</div>
      )}
      {!isLoading && !isError && (
        <>
          <QuickViewTable
            garments={garments}
            categories={categories || []}
            sizeTypes={sizeTypes || []}
            providers={providers || []}
            colors={colors || []}
          />

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm mt-6">
              <span className="text-[#4a7c80] font-medium">
                Página {page} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all disabled:opacity-50"
                  style={{ background: "#e0f5f5", color: "#0d5c63" }}
                >
                  ← Anterior
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all disabled:opacity-50"
                  style={{ background: "#e0f5f5", color: "#0d5c63" }}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}