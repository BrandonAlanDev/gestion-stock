"use server";

import { getGarments, getCategories, getProviders } from "@/actions/garments";
import { getSizeTypes } from "@/actions/sizes";
import Search from "@/components/Search";
import CategoryFilter from "@/components/garment/CategoryFilter";
import CategoryModal from "@/components/garment/CategoryModal";
import MovementModal from "@/components/garment/MovementModal";
import ProductModal from "@/components/garment/productModal";
import QuickViewTable from "@/components/garment/QuickViewTable"; // El nuevo componente

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";
  const category = params?.category || "";

  const [garments, sizeTypes, categories, providers] = await Promise.all([
    getGarments(query, category),
    getSizeTypes(),
    getCategories(),
    getProviders(),
  ]);

  return (
    <div className="p-8 bg-neutral-950 min-h-screen text-neutral-100 pt-24">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white flex items-center gap-3">
            <span className="w-2 h-8 bg-amber-500 rounded-full inline-block" />
            Gestión de Inventario
          </h1>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 ml-5">
            Control de Stock y Operaciones
          </p>
        </div>
        
        <div className="flex flex-row flex-wrap gap-3">
          <MovementModal garments={garments} /> 
          <CategoryModal sizeTypes={sizeTypes} /> 
          <ProductModal 
            categories={categories} 
            sizes={sizeTypes} 
            providers={providers} 
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

      {/* TABLA PRINCIPAL CON VISTA RÁPIDA */}
      <QuickViewTable 
        garments={garments} 
        categories={categories} 
        sizeTypes={sizeTypes} 
        providers={providers} 
      />
    </div>
  );
}