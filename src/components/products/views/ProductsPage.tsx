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

  // Sincronizar categoría y acordeón con la URL
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

  // Sincronizar subcategoría seleccionada con la URL
  useEffect(() => {
    if (!subcategoriaParam) {
      setSelectedSub("Todos");
      return;
    }
    const decoded = decodeURIComponent(subcategoriaParam).trim().toLowerCase();
    // Verificar que la subcategoría exista en la categoría actual
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

  // Solo ordenar (sin filtrar localmente)
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

  // Manejo de categoría
  const handleCategoryClick = (cat: any) => {
    onFilterChange?.(cat.name);
  };

  // Manejo de "Todo {cat.name}"
  const handleTodoSubClick = (catName: string) => {
    onFilterChange?.(catName);
  };

  // Manejo de subcategoría (con transición para loading)
  const handleSubCategoryClick = (catName: string, subName: string) => {
    onFilterChange?.(catName, subName);
  };

  // Limpiar todo
  const handleClearAllCategories = () => {
    onFilterChange?.();
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50 relative">
      {/* Overlay de carga durante transición */}
      {isPending && (
        <div className="fixed inset-0 z-50 bg-white/70 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Catálogo Completo</h1>
            <p className="text-slate-500 mt-2">Explora lo último en deporte.</p>
          </div>
          <select
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-accent outline-none cursor-pointer text-teal-400 font-bold"
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
          {/* SIDEBAR */}
          <aside className="w-full lg:w-64">
            <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2 text-slate-900">
              <Filter className="w-4 h-4" /> Categorías
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleClearAllCategories}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${selectedCat === "Todos"
                  ? "bg-primary text-teal-400"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                Todos los productos
              </button>

              {categories.map((cat: any) => {
                const isOpen = openCategoryId === cat.id;
                const isCurrentCatSelected = selectedCat === cat.name;

                return (
                  <div key={cat.id}>
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      className={`flex w-full justify-between px-3 py-2 rounded-lg text-sm ${isCurrentCatSelected
                        ? "bg-primary text-teal-400"
                        : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      <span>{cat.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180 text-teal-400" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && cat.subCategories && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden pl-4 border-l border-slate-200 ml-3 space-y-1"
                        >
                          <button
                            onClick={() => handleTodoSubClick(cat.name)}
                            className={`block text-left px-3 py-1.5 text-xs ${isCurrentCatSelected && selectedSub === "Todos"
                              ? "text-teal-400 font-bold"
                              : "text-slate-500"
                              }`}
                          >
                            • Todo {cat.name}
                          </button>
                          {cat.subCategories.map((sub: any) => {
                            const isSubActive =
                              isCurrentCatSelected &&
                              selectedSub === sub.name.toLowerCase();
                            return (
                              <button
                                key={sub.id}
                                onClick={() => handleSubCategoryClick(cat.name, sub.name)}
                                className={`block text-left px-3 py-1.5 text-xs ${isSubActive
                                  ? "text-teal-400 font-bold"
                                  : "text-slate-500"
                                  }`}
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

          {/* PRODUCTOS */}
          <div className="flex-1">
            {processedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {processedProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} addToCart={addToCart} />
                ))}
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border-dashed border-slate-200">
                <SlidersHorizontal className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">No se encontraron productos</p>
                <button
                  onClick={handleClearAllCategories}
                  className="mt-4 text-accent font-bold hover:underline"
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