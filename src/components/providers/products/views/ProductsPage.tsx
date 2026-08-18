"use client";

import React, { useState, useMemo, useEffect, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/ui/pagination";
import ProductCard from "../cards/ProductCard";

interface Props {
  garments: any[];
  categories: any[];
  addToCart: (product: any) => void;
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  onFilterChange?: (catName?: string, subName?: string) => void;
}

const ProductsPage = ({
  garments = [],
  categories = [],
  addToCart,
  currentPage,
  totalPages,
  onPageChange,
  onFilterChange,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const categoriaParam = searchParams.get("categoria");
  const subcategoriaParam = searchParams.get("subcategoria");

  const [selectedCat, setSelectedCat] = useState("Todos");
  const [selectedSub, setSelectedSub] = useState("Todos");
  const [sortConfig, setSortConfig] = useState({ key: "date", order: "desc" });
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!categoriaParam) {
      setSelectedCat("Todos");
      setOpenCategoryId(null);
      return;
    }
    const decoded = decodeURIComponent(categoriaParam).trim().toLowerCase();
    const found = categories.find(
      (cat: any) => cat.name.trim().toLowerCase() === decoded
    );
    if (found) {
      setSelectedCat(found.name);
      setOpenCategoryId(found.id);
    } else {
      setSelectedCat("Todos");
    }
  }, [categoriaParam, categories]);

  useEffect(() => {
    if (!subcategoriaParam) {
      setSelectedSub("Todos");
      return;
    }
    const decoded = decodeURIComponent(subcategoriaParam).trim().toLowerCase();
    const cat = categories.find(
      (c: any) => c.name.trim().toLowerCase() === decodeURIComponent(categoriaParam || "").trim().toLowerCase()
    );
    if (cat) {
      const subExists = cat.subCategories?.some(
        (sub: any) => sub.name.trim().toLowerCase() === decoded
      );
      if (subExists) {
        setSelectedSub(decoded);
      } else {
        setSelectedSub("Todos");
      }
    } else {
      setSelectedSub("Todos");
    }
  }, [subcategoriaParam, categories, categoriaParam]);

  const processedProducts = useMemo(() => {
    return [...garments].sort((a, b) => {
      let valA: any, valB: any;
      switch (sortConfig.key) {
        case "price":
          valA = Number(a.price); valB = Number(b.price); break;
        case "title":
          valA = a.name; valB = b.name; break;
        case "date":
        default:
          valA = new Date(a.createdAt); valB = new Date(b.createdAt); break;
      }
      return sortConfig.order === "asc"
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });
  }, [garments, sortConfig]);

  const handleTodoSubClick = (catName: string) => {
    onFilterChange?.(catName);
  };

  const handleSubCategoryClick = (catName: string, subName: string) => {
    onFilterChange?.(catName, subName);
  };

  const handleClearAllCategories = () => {
    onFilterChange?.();
  };

  return (
    <div className="pt-24 min-h-screen bg-[var(--color-fondo-sitio)] relative">
      {isPending && (
        <div className="fixed inset-0 z-50 bg-[var(--color-fondo-sitio)]/70 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--color-primario)" }} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[var(--texto-sobre-fondo)]">Catálogo Completo</h1>
            <p className="text-[var(--texto-sobre-fondo)] opacity-60 mt-2">Explora lo último en deporte.</p>
          </div>
          <select
            className="appearance-none bg-[var(--color-secundario)] border border-[var(--color-secundario)] rounded-xl px-4 py-2.5 text-sm text-[var(--texto-sobre-secundario)] focus:ring-2 outline-none cursor-pointer font-bold"
            style={{ '--tw-ring-color': "var(--color-primario)", color: "var(--color-primario)" } as React.CSSProperties}
            onChange={(e) => {
              const [key, order] = e.target.value.split("-");
              setSortConfig({ key, order });
            }}
          >
            <option value="date-desc">Novedades</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="title-asc">Nombre: A-Z</option>
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64">
            <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2 text-[var(--texto-sobre-fondo)]">
              <Filter className="w-4 h-4" /> Categorías
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleClearAllCategories}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${selectedCat === "Todos"
                  ? "bg-opacity-10 font-bold"
                  : "text-[var(--texto-sobre-fondo)] opacity-70 hover:bg-[var(--color-secundario)] hover:opacity-100"
                  }`}
                style={{ 
                  backgroundColor: selectedCat === "Todos" ? "color-mix(in srgb, var(--color-primario) 10%, transparent)" : undefined,
                  color: selectedCat === "Todos" ? "var(--color-primario)" : undefined
                }}
              >
                Todos los productos
              </button>

              {categories.map((cat: any) => {
                const isOpen = openCategoryId === cat.id;
                const isCurrentCatSelected = selectedCat === cat.name;

                return (
                  <div key={cat.id}>
                    <button
                      onClick={() => setOpenCategoryId(isOpen ? null : cat.id)}
                      className={`flex w-full justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isCurrentCatSelected
                        ? "bg-opacity-10 font-semibold"
                        : "text-[var(--texto-sobre-fondo)] opacity-70 hover:bg-[var(--color-secundario)] hover:opacity-100"
                        }`}
                      style={{ 
                        backgroundColor: isCurrentCatSelected ? "color-mix(in srgb, var(--color-primario) 10%, transparent)" : undefined,
                        color: isCurrentCatSelected ? "var(--color-primario)" : undefined
                      }}
                    >
                      <span>{cat.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        style={{ color: isOpen ? "var(--color-primario)" : undefined }}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && cat.subCategories && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden pl-4 border-l border-[var(--color-secundario)] ml-3 space-y-1"
                        >
                          <button
                            onClick={() => handleTodoSubClick(cat.name)}
                            className={`block text-left px-3 py-1.5 text-xs transition-colors ${isCurrentCatSelected && selectedSub === "Todos"
                              ? "font-bold"
                              : "text-[var(--texto-sobre-fondo)] opacity-60 hover:opacity-100"
                              }`}
                            style={{ color: isCurrentCatSelected && selectedSub === "Todos" ? "var(--color-primario)" : undefined }}
                          >
                            • Todo {cat.name}
                          </button>
                          {cat.subCategories.map((sub: any) => {
                            const isSubActive = isCurrentCatSelected && selectedSub === sub.name.toLowerCase();
                            return (
                              <button
                                key={sub.id}
                                onClick={() => handleSubCategoryClick(cat.name, sub.name)}
                                className={`block text-left px-3 py-1.5 text-xs transition-colors ${isSubActive
                                  ? "font-bold"
                                  : "text-[var(--texto-sobre-fondo)] opacity-60 hover:opacity-100"
                                  }`}
                                style={{ color: isSubActive ? "var(--color-primario)" : undefined }}
                              >
                                {sub.name}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </aside>

          <div className="flex-1">
            {processedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {processedProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} addToCart={addToCart} />
                ))}
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center bg-[var(--color-secundario)] rounded-3xl border-dashed border-[var(--color-secundario)] border-2">
                <SlidersHorizontal className="w-12 h-12 text-[var(--texto-sobre-secundario)] opacity-50 mb-4" />
                <p className="text-[var(--texto-sobre-secundario)] opacity-70 font-medium">No se encontraron productos</p>
                <button
                  onClick={handleClearAllCategories}
                  className="mt-4 font-bold hover:underline transition-colors"
                  style={{ color: "var(--color-primario)" }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;