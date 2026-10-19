"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Filter, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/ui/pagination";
import ProductCard from "../cards/ProductCard";
import type { CategoriaCatalogo, ProductoCatalogo } from "@/types/productos/catalogo-publico";

interface Props {
  garments: ProductoCatalogo[];
  categories: CategoriaCatalogo[];
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  onFilterChange?: (catName?: string, subName?: string) => void;
}

const ProductsPage = ({
  garments = [],
  categories = [],
  currentPage,
  totalPages,
  onPageChange,
  onFilterChange,
}: Props) => {
  const searchParams = useSearchParams();
  
  const categoriaParam = searchParams.get("categoria");
  const subcategoriaParam = searchParams.get("subcategoria");

  const [selectedCat, setSelectedCat] = useState("Todos");
  const [selectedSub, setSelectedSub] = useState("Todos");
  const [sortConfig, setSortConfig] = useState({ key: "date", order: "desc" });
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!categoriaParam) {
      setSelectedCat("Todos");
      setOpenCategoryId(null);
      return;
    }
    const decoded = decodeURIComponent(categoriaParam).trim().toLowerCase();
    const found = categories.find(
      (cat) => cat.name.trim().toLowerCase() === decoded
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
      (c) => c.name.trim().toLowerCase() === decodeURIComponent(categoriaParam || "").trim().toLowerCase()
    );
    if (cat) {
      const subExists = cat.subCategories?.some(
        (sub) => sub.name.trim().toLowerCase() === decoded
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
      let valA: number | string;
      let valB: number | string;
      switch (sortConfig.key) {
        case "price":
          valA = Number(a.price); valB = Number(b.price); break;
        case "title":
          valA = a.name; valB = b.name; break;
        case "date":
        default:
          valA = new Date(a.createdAt).getTime(); valB = new Date(b.createdAt).getTime(); break;
      }
      const comparacion = typeof valA === "number" && typeof valB === "number"
        ? valA - valB
        : String(valA).localeCompare(String(valB), "es");
      return sortConfig.order === "asc" ? comparacion : -comparacion;
    });
  }, [garments, sortConfig]);

  const handleTodoSubClick = (catName: string) => {
    onFilterChange?.(catName);
    setFiltersOpen(false);
  };

  const handleSubCategoryClick = (catName: string, subName: string) => {
    onFilterChange?.(catName, subName);
    setFiltersOpen(false);
  };

  const handleClearAllCategories = () => {
    onFilterChange?.();
    setFiltersOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-[var(--color-fondo-sitio)] pt-20 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-current/10 pb-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--texto-sobre-fondo)] sm:text-4xl">Productos</h1>
            <p className="mt-2 text-sm text-[var(--texto-sobre-fondo)] opacity-70">Explorá el catálogo y encontrá lo que buscás.</p>
          </div>
          <div className="relative w-full sm:w-auto">
            <label htmlFor="orden-productos" className="mb-1 block text-xs font-medium text-[var(--texto-sobre-fondo)] opacity-70">Ordenar esta página</label>
            <select
              id="orden-productos"
              className="w-full appearance-none rounded-lg border border-current/15 bg-[var(--color-secundario)] px-4 py-3 pr-9 text-sm font-medium text-[var(--texto-sobre-secundario)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primario)] sm:min-w-48"
              onChange={(e) => {
                const [key, order] = e.target.value.split("-");
                setSortConfig({ key, order });
              }}
            >
              <option value="date-desc">Novedades</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="title-asc">Nombre: A a Z</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute bottom-3.5 right-3"
              style={{ color: "var(--texto-sobre-secundario)" }}
            />
          </div>
        </div>

        <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} aria-controls="filtros-catalogo" className="mb-5 flex min-h-11 w-full items-center justify-between rounded-lg border border-current/15 px-4 text-sm font-medium text-[var(--texto-sobre-fondo)] lg:hidden">
          <span className="flex items-center gap-2"><Filter size={16} /> Categorías{selectedCat !== "Todos" ? ` · ${selectedCat}` : ""}</span>
          <ChevronDown size={16} className={filtersOpen ? "rotate-180" : ""} />
        </button>
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside id="filtros-catalogo" className={`w-full shrink-0 lg:w-56 ${filtersOpen ? "block" : "hidden lg:block"}`}>
            <h2 className="mb-4 hidden items-center gap-2 text-sm font-semibold text-[var(--texto-sobre-fondo)] lg:flex">
              <Filter className="w-4 h-4" /> Categorías
            </h2>
            <div className="space-y-1 rounded-xl border border-current/10 p-2 lg:border-0 lg:p-0">
              <button
                onClick={handleClearAllCategories}
                className={`block min-h-10 w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${selectedCat === "Todos"
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

              {categories.map((cat) => {
                const isOpen = openCategoryId === cat.id;
                const isCurrentCatSelected = selectedCat === cat.name;

                return (
                  <div key={cat.id}>
                    <button
                      onClick={() => setOpenCategoryId(isOpen ? null : cat.id)}
                      aria-expanded={isOpen}
                      className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${isCurrentCatSelected
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
                            className={`block min-h-9 w-full px-3 py-2 text-left text-sm transition-colors ${isCurrentCatSelected && selectedSub === "Todos"
                              ? "font-semibold"
                              : "text-[var(--texto-sobre-fondo)] opacity-60 hover:opacity-100"
                              }`}
                            style={{ color: isCurrentCatSelected && selectedSub === "Todos" ? "var(--color-primario)" : undefined }}
                          >
                            Todo {cat.name}
                          </button>
                          {cat.subCategories.map((sub) => {
                            const isSubActive = isCurrentCatSelected && selectedSub === sub.name.toLowerCase();
                            return (
                              <button
                                key={sub.id}
                                onClick={() => handleSubCategoryClick(cat.name, sub.name)}
                                className={`block min-h-9 w-full px-3 py-2 text-left text-sm transition-colors ${isSubActive
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
              <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                {processedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center bg-[var(--color-secundario)] rounded-3xl border-dashed border-[var(--color-secundario)] border-2">
                <SlidersHorizontal className="w-12 h-12 text-[var(--texto-sobre-secundario)] opacity-50 mb-4" />
                <p className="text-[var(--texto-sobre-secundario)] opacity-70 font-medium">No se encontraron productos</p>
                <button
                  onClick={handleClearAllCategories}
                  className="mt-4 font-bold hover:underline transition-colors cursor-pointer"
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
