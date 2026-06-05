"use client";
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/ui/pagination";
import ProductCard from "../cards/ProductCard";

interface Props {
  shoes: any[]; // Cambiado de garments a shoes para calzado
  categories: any[];
  addToCart: (product: any) => void;
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  onFilterChange?: (catName?: string, subName?: string) => void;
}

const ProductsPage = ({
  shoes = [],
  categories = [],
  addToCart,
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

  // Ordenar el calzado según el criterio seleccionado
  const processedProducts = useMemo(() => {
    return [...shoes].sort((a, b) => {
      let valA: any, valB: any;
      switch (sortConfig.key) {
        case "price":
          valA = Number(a.price); valB = Number(b.price); break;
        case "title":
          valA = a.name; valB = b.name; break;
        case "date":
          valA = new Date(a.createdAt); valB = new Date(b.createdAt); break;
        default:
          valA = new Date(a.createdAt); valB = new Date(b.createdAt); break;
      }
      return sortConfig.order === "asc"
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });
  }, [shoes, sortConfig]);

  // Manejo de clicks en filtros
  const handleCategoryClick = (cat: any) => {
    onFilterChange?.(cat.name);
  };

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
    <div className="pt-24 min-h-screen bg-slate-50 relative">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER DE CALZADO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Catálogo de Calzado</h1>
            <p className="text-slate-500 mt-2">Pisadas con estilo urbano y rendimiento deportivo.</p>
          </div>
          <div className="relative">
            <select
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer text-slate-800 font-bold shadow-sm"
              onChange={(e) => {
                const [key, order] = e.target.value.split("-");
                setSortConfig({ key, order });
              }}
            >
              <option value="date-desc">Últimos Modelos</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="title-asc">Modelo: A-Z</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR DE FILTROS */}
          <aside className="w-full lg:w-64 shrink-0">
            <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2 text-slate-900 tracking-wider">
              <Filter className="w-4 h-4" /> Estilos y Líneas
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleClearAllCategories}
                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  selectedCat === "Todos"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                Todo el calzado
              </button>

              {categories.map((cat: any) => {
                const isOpen = openCategoryId === cat.id;
                const isCurrentCatSelected = selectedCat === cat.name;

                return (
                  <div key={cat.id} className="rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      className={`flex w-full justify-between items-center px-4 py-2.5 text-sm font-medium transition-colors ${
                        isCurrentCatSelected
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-200/60"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && cat.subCategories && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-slate-100/50 pl-4 pr-2 py-1.5 space-y-1 border-l-2 border-slate-300 ml-4 my-1"
                        >
                          <button
                            onClick={() => handleTodoSubClick(cat.name)}
                            className={`block w-full text-left px-3 py-1.5 text-xs rounded-md ${
                              isCurrentCatSelected && selectedSub === "Todos"
                                ? "text-slate-900 font-bold bg-slate-200/50"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            • Ver todo {cat.name}
                          </button>
                          {cat.subCategories.map((sub: any) => {
                            const isSubActive =
                              isCurrentCatSelected &&
                              selectedSub === sub.name.toLowerCase();
                            return (
                              <button
                                key={sub.id}
                                onClick={() => handleSubCategoryClick(cat.name, sub.name)}
                                className={`block w-full text-left px-3 py-1.5 text-xs rounded-md ${
                                  isSubActive
                                    ? "text-slate-900 font-bold bg-slate-200/50"
                                    : "text-slate-500 hover:text-slate-800"
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

          {/* GRILLA DE PRODUCTOS */}
          <div className="flex-1">
            {processedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {processedProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} addToCart={addToCart} />
                ))}
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 shadow-sm">
                <SlidersHorizontal className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium text-center">No encontramos calzado con esos filtros aplicados</p>
                <button
                  onClick={handleClearAllCategories}
                  className="mt-4 px-4 py-2 bg-slate-100 rounded-xl text-slate-800 text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;