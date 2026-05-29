"use server";

import { getGarments, getCategories, getProviders } from "@/actions/garments";
import { getSizeTypes } from "@/actions/sizes";
import { getColors } from "@/actions/colors";
import Search from "@/components/search/Search";
import CategoryFilter from "@/components/categories/filters/CategoryFilter";
import MovementModal from "@/components/movements/MovementModal";
import ProductModal from "@/components/products/modals/ProductModal";
import QuickViewTable from "@/components/products/modals/QuickViewTable";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";
  const category = params?.category || "";

  const [garmentsResult, sizeTypes, categories, providers, colors] = await Promise.all([
    getGarments(1, 1000, category || undefined, query || undefined), // traemos todos por ahora
    getSizeTypes(),
    getCategories(),
    getProviders(),
    getColors(),
  ]);
  // Desestructuramos la data de la respuesta
  const garments = garmentsResult.data || [];

  return (
    <div className="p-8 min-h-screen pt-24" style={{ background: "#f0fafa", color: "#0d2b2e" }}>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1
            className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3"
            style={{ color: "#083d42" }}
          >
            {/* Acento verde marino en lugar de amber */}
            <span
              className="w-2 h-8 rounded-full inline-block"
              style={{ background: "#0d5c63" }}
            />
            Gestión de Inventario
          </h1>
          <p
            className="text-[10px] font-black uppercase mt-1 ml-5"
            style={{ color: "#4a7c80", letterSpacing: "0.4em" }}
          >
            Control de Stock y Operaciones
          </p>
        </div>

        <div className="flex flex-row flex-wrap gap-3">
          <MovementModal garments={garments} />
          <ProductModal
            categories={categories}
            sizes={sizeTypes}
            providers={providers}
            colors={colors}
          />
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Search className="w-full" />
        </div>
        <div className="w-full md:w-72">
          <CategoryFilter categories={categories} />
        </div>
      </div>

      {/* TABLA */}
      <QuickViewTable
        garments={garments}
        categories={categories}
        sizeTypes={sizeTypes}
        providers={providers}
        colors={colors}
      />
    </div>
  );
}