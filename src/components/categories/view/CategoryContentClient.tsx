"use client";

import { useState } from "react";
import ProductCard from "@/components/providers/products/cards/ProductCard";
import { SkeletonTarjetas } from "@/components/ui/skeleton-vistas";
import { Package, Layers, ChevronDown } from "lucide-react";
import type { ProductoCatalogo } from "@/types/productos/catalogo-publico";

interface SubCategory {
  id: string;
  name: string;
}

interface CategoryContentClientProps {
  subCategories: SubCategory[];
  garments: ProductoCatalogo[];
  selectedSubId: string; // "all" o el id de la subcategoría activa
  onFilterChange: (subcategoria?: string) => void;
  loading?: boolean;
}

export default function CategoryContentClient({
  subCategories,
  garments,
  selectedSubId,
  onFilterChange,
  loading = false,
}: CategoryContentClientProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtroActual = subCategories.find((sub) => sub.id === selectedSubId)?.name;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} aria-controls="filtros-subcategorias" className="mb-5 flex min-h-11 w-full items-center justify-between rounded-lg border border-current/15 px-4 text-sm font-medium text-[var(--texto-sobre-fondo)] md:hidden">
        <span className="flex items-center gap-2"><Layers size={16} /> {filtroActual ?? "Todos los productos"}</span>
        <ChevronDown size={16} className={filtersOpen ? "rotate-180" : ""} />
      </button>
      <div className="flex flex-col gap-8 md:flex-row">
        {/* SIDEBAR */}
        <aside id="filtros-subcategorias" className={`w-full shrink-0 md:w-56 ${filtersOpen ? "block" : "hidden md:block"}`}>
          <div className="sticky top-28 rounded-xl border border-current/10 bg-[var(--color-secundario)] p-3">
            <h2 className="mb-3 hidden items-center gap-2 text-sm font-semibold text-[var(--texto-sobre-secundario)] md:flex">
              <Layers size={14} className="text-[var(--color-primario)]" />
              Subcategorías
            </h2>
            <div className="space-y-1">
              {/* Todos los productos */}
              <button
                type="button"
                onClick={() => { onFilterChange(); setFiltersOpen(false); }}
                className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  selectedSubId === "all"
                    ? "bg-[var(--color-primario)] text-[var(--texto-sobre-primario)]"
                    : "text-[var(--texto-sobre-secundario)] opacity-70 hover:bg-[var(--color-fondo-sitio)]/10 hover:opacity-100"
                }`}
              >
                Todos los productos
              </button>

              {/* Subcategorías */}
              {subCategories.map((sub) => {
                const isActive = selectedSubId === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => { onFilterChange(sub.id); setFiltersOpen(false); }}
                    className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--color-primario)] text-[var(--texto-sobre-primario)]"
                        : "text-[var(--texto-sobre-secundario)] opacity-70 hover:bg-[var(--color-fondo-sitio)]/10 hover:opacity-100"
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* PRODUCTOS */}
        <main className="min-w-0 flex-1">
          {loading ? (
            <SkeletonTarjetas cantidad={6} admin={false} />
          ) : garments.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {garments.map((garment, indice) => <ProductCard key={garment.id} product={garment} priority={indice < 3} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-current/10 bg-[var(--color-secundario)] py-20 text-center">
              <Package size={44} className="mx-auto mb-4 text-[var(--color-primario)]/30" />
              <p className="text-sm font-semibold text-[var(--texto-sobre-secundario)]">
                No hay productos cargados
              </p>
              <p className="text-xs text-[var(--texto-sobre-secundario)] opacity-70 mt-1">
                Pronto vas a encontrar novedades en esta sección.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
