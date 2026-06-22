"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGarments } from "@/hooks/useGarments";
import { useCategories } from "@/hooks/useCategories";
import { useSizeTypes } from "@/hooks/useSizeTypes";
import { useProviders } from "@/hooks/useProviders";
import { useColors } from "@/hooks/useColors";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import Search from "@/components/search/Search";
import CategoryFilter from "@/components/categories/filters/CategoryFilter";
import MovementModal from "@/components/movements/MovementModal";
import ProductModal from "@/components/products/modals/ProductModal";
import QuickViewTable from "@/components/products/modals/QuickViewTable";

// --- UTILIDAD PARA CALCULAR EL CONTRASTE ---
function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function DashboardClient() {
  const queryClient = useQueryClient();
  const pageConfig = usePageConfig();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const limit = 20;

  // Variables dinámicas de color
  const primaryColor = pageConfig?.pageConfig?.primaryColor || "#000000";
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#FFFFFF";

  // Cálculos de legibilidad
  const textColor = getContrastColor(secondaryColor);
  const primaryTextColor = getContrastColor(primaryColor);
  const isDarkBg = textColor === "#ffffff";

  // Overlays basados en el contraste
  const overlayBg = isDarkBg ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)";

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
    <div className=" md:ml-60 p-6 sm:p-8 w-full mt-18 " style={{ backgroundColor: secondaryColor, color: textColor }}>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3" style={{ color: textColor }}>
            <span className="w-2 h-8 rounded-full inline-block" style={{ backgroundColor: primaryColor }} />
            Gestión de Inventario
          </h1>
          <p className="text-[10px] font-black uppercase mt-1 ml-5 opacity-70" style={{ color: textColor, letterSpacing: "0.4em" }}>
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
        <div className="text-center py-12 font-medium" style={{ color: primaryColor }}>Cargando productos...</div>
      )}
      {isError && (
        <div className="text-center py-12 text-red-500 font-medium">Error: {(error as Error).message}</div>
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
              <span className="font-medium opacity-60" style={{ color: textColor }}>
                Página {page} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all disabled:opacity-30 cursor-pointer"
                  style={{ backgroundColor: overlayBg, color: textColor }}
                >
                  ← Anterior
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all disabled:opacity-30 cursor-pointer"
                  style={{ backgroundColor: overlayBg, color: textColor }}
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