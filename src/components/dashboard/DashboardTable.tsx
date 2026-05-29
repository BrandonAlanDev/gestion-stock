"use client";

import Link from "next/link";
import QuickViewTable from "@/components/products/modals/QuickViewTable";

interface DashboardTableProps {
  garments: any[];
  categories: any[];
  sizeTypes: any[];
  providers: any[];
  colors: any[];
  currentPage: number;
  totalPages: number;
  query: string;
  category: string;
}

export default function DashboardTable({
  garments,
  categories,
  sizeTypes,
  providers,
  colors,
  currentPage,
  totalPages,
  query,
  category,
}: DashboardTableProps) {
  // Construir URL base para paginación preservando filtros actuales
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (category) params.set("category", category);
    params.set("page", String(page));
    return `/dashboard?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <QuickViewTable
        garments={garments}
        categories={categories}
        sizeTypes={sizeTypes}
        providers={providers}
        colors={colors}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#4a7c80] font-medium">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all"
                style={{ background: "#e0f5f5", color: "#0d5c63" }}
              >
                ← Anterior
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all"
                style={{ background: "#e0f5f5", color: "#0d5c63" }}
              >
                Siguiente →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}