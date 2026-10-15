"use client";

import Link from "next/link";
import ProductGrid from "@/components/providers/products/grid/ProductGrid";
import { Package, Layers } from "lucide-react";
import type { Garment } from "@/components/providers/products/grid/ProductGrid";

interface SubCategory {
  id: string;
  name: string;
}

interface CategoryContentClientProps {
  subCategories: SubCategory[];
  garments: Garment[];
  selectedSubId: string; // "all" o el id de la subcategoría activa
  basePath: string; // ej: "/productos/ropa"
}

export default function CategoryContentClient({
  subCategories,
  garments,
  selectedSubId,
  basePath,
}: CategoryContentClientProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-28 bg-[var(--color-secundario)] border border-[var(--color-secundario)] rounded-2xl p-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--texto-sobre-secundario)] opacity-70 mb-4 flex items-center gap-2">
              <Layers size={14} className="text-[var(--color-primario)]" />
              Estilos
            </h2>
            <div className="space-y-1">
              {/* Todos los productos */}
              <Link
                href={basePath}
                className={`w-full block px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                  selectedSubId === "all"
                    ? "bg-[var(--color-primario)] text-[var(--texto-sobre-primario)] shadow-lg"
                    : "text-[var(--texto-sobre-secundario)] opacity-70 hover:bg-[var(--color-fondo-sitio)]/10 hover:opacity-100"
                }`}
              >
                Todos los productos
              </Link>

              {/* Subcategorías */}
              {subCategories.map((sub) => {
                const isActive = selectedSubId === sub.id;
                return (
                  <Link
                    key={sub.id}
                    href={`${basePath}?subcategory=${sub.id}`}
                    className={`w-full block px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? "bg-[var(--color-primario)] text-[var(--texto-sobre-primario)] shadow-lg"
                        : "text-[var(--texto-sobre-secundario)] opacity-70 hover:bg-[var(--color-fondo-sitio)]/10 hover:opacity-100"
                    }`}
                  >
                    {sub.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* PRODUCTOS */}
        <main className="flex-1">
          {garments.length > 0 ? (
            <ProductGrid garments={garments} />
          ) : (
            <div className="text-center py-24 bg-[var(--color-secundario)] border border-[var(--color-secundario)] rounded-3xl">
              <Package size={44} className="mx-auto mb-4 text-[var(--color-primario)]/30" />
              <p className="font-bold text-[var(--texto-sobre-secundario)] uppercase tracking-wide text-sm">
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
