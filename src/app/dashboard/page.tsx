"use server";

import { getGarments, getCategories, getProviders } from "@/actions/garments";
import { getSizeTypes } from "@/actions/sizes";
import { getColors } from "@/actions/colors";
import DashboardTable from "@/components/dashboard/DashboardTable";
import Search from "@/components/search/Search";
import CategoryFilter from "@/components/categories/filters/CategoryFilter";
import MovementModal from "@/components/movements/MovementModal";
import ProductModal from "@/components/products/modals/ProductModal";

interface DashboardPageProps {
  searchParams?: Promise<{
    query?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const query = params?.query || "";
  const category = params?.category || "";
  const currentPage = Number(params?.page) || 1;
  const limit = 20; // Productos por página

  // Obtener datos paginados del servidor
  const garmentsResult = await getGarments(
    currentPage,
    limit,
    category || undefined,
    query || undefined
  );

  // Obtener datos de referencia (categorías, talles, proveedores, colores)
  const [sizeTypes, categories, providers, colors] = await Promise.all([
    getSizeTypes(),
    getCategories(),
    getProviders(),
    getColors(),
  ]);

  const garments = garmentsResult?.data || [];
  const totalPages = garmentsResult?.totalPages || 1;

  return (
    <div className="p-8 min-h-screen pt-24" style={{ background: "#f0fafa", color: "#0d2b2e" }}>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1
            className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3"
            style={{ color: "#083d42" }}
          >
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

      {/* TABLA + PAGINACIÓN */}
      <DashboardTable
        garments={garments}
        categories={categories}
        sizeTypes={sizeTypes}
        providers={providers}
        colors={colors}
        currentPage={currentPage}
        totalPages={totalPages}
        query={query}
        category={category}
      />
    </div>
  );
}