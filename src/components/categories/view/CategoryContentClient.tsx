"use client";

import { useState } from "react";
import ProductGrid from "@/components/products/grid/ProductGrid";
import { Package, Layers } from "lucide-react";

interface SubCategory {
  id: string;
  name: string;
}

interface CategoryContentClientProps {
  subCategories: SubCategory[];
  garments: any[]; // Mantiene la estructura completa que requiere tu ProductGrid
}

export default function CategoryContentClient({
  subCategories,
  garments,
}: CategoryContentClientProps) {
  // Estado para la subcategoría seleccionada. 'all' significa que muestra todo.
  const [selectedSubId, setSelectedSubId] = useState<string>("all");

  // Filtrado de productos basado en la selección del Sidebar
  const filteredGarments = selectedSubId === "all"
    ? garments
    : garments.filter((g) => g.subCategoryId === selectedSubId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* BARRA LATERAL (SIDEBAR) */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-28 bg-neutral-50  border-neutral-100 rounded-2xl p-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
              <Layers size={14} className="text-cyan-500" />
              Estilos
            </h2>
            <div className="space-y-1">
              {/* Opción por defecto para ver todo */}
              <button
                onClick={() => setSelectedSubId("all")}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                  selectedSubId === "all"
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                Todos los productos
              </button>

              {/* Mapeo de las subcategorías dinámicas */}
              {subCategories.map((sub) => {
                const isActive = selectedSubId === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubId(sub.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL (PRODUCTOS) */}
        <main className="flex-1">
          {filteredGarments.length > 0 ? (
            // Reutiliza tu componente ProductGrid configurado
            <ProductGrid garments={filteredGarments} />
          ) : (
            <div className="text-center py-24 bg-neutral-50 border border-neutral-100 rounded-3xl text-neutral-400">
              <Package size={44} className="mx-auto mb-4 text-cyan-500/30" />
              <p className="font-bold text-neutral-700 uppercase tracking-wide text-sm">
                No hay productos cargados
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Pronto vas a encontrar novedades en esta sección.
              </p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}