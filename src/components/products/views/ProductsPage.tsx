"use client";

import React, {
  useState,
  useMemo,
  useEffect,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  ChevronDown,
  Filter,
  SlidersHorizontal,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import ProductCard from "../cards/ProductCard";

interface Props {
  garments: any[];
  categories: any[];
  addToCart: (product: any) => void;
}

const ProductsPage = ({
  garments = [],
  categories = [],
  addToCart,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // =========================================
  // QUERY PARAMS
  // =========================================
  const categoriaParam = searchParams.get("categoria");

  // =========================================
  // STATES
  // =========================================
  const [selectedCat, setSelectedCat] = useState("Todos");
  const [selectedSub, setSelectedSub] = useState("Todos");

  const [sortConfig, setSortConfig] = useState({
    key: "date",
    order: "desc",
  });

  // AHORA ES UN STRING: Guarda solo el ID del único acordeón abierto
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  // =========================================
  // AUTO SELECT CATEGORY FROM URL (SOLO AL CARGAR)
  // =========================================
  useEffect(() => {
    if (!categoriaParam) return;

    const foundCategory = categories.find(
      (cat: any) =>
        cat.name.toLowerCase() === categoriaParam.toLowerCase()
    );

    if (foundCategory) {
      setSelectedCat(foundCategory.name);
      setOpenCategoryId(foundCategory.id); // Abre el acordeón inicial
    }
  }, [categoriaParam, categories]);

  // =========================================
  // FILTROS + ORDENAMIENTO
  // =========================================
  const processedProducts = useMemo(() => {
    let filtered = garments.filter((p) => {
      const matchCat =
        selectedCat === "Todos" ||
        p.category?.name === selectedCat;

      const matchSub =
        selectedSub === "Todos" ||
        p.subCategory?.name === selectedSub;

      return matchCat && matchSub;
    });

    return filtered.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortConfig.key) {
        case "price":
          valA = Number(a.price);
          valB = Number(b.price);
          break;

        case "title":
          valA = a.name;
          valB = b.name;
          break;

        case "date":
        default:
          valA = new Date(a.createdAt);
          valB = new Date(b.createdAt);
          break;
      }

      if (sortConfig.order === "asc") {
        return valA > valB ? 1 : -1;
      }

      return valA < valB ? 1 : -1;
    });
  }, [
    garments,
    selectedCat,
    selectedSub,
    sortConfig,
  ]);

  // =========================================
  // MANEJO EXCLUSIVO DEL ACORDEÓN (MUTUAMENTE EXCLUYENTE)
  // =========================================
  const handleCategoryClick = (cat: any) => {
    // Si hacés click en la que ya está abierta, se cierra por completo. 
    // Si no, se abre la nueva y automáticamente cierra la anterior.
    setOpenCategoryId(openCategoryId === cat.id ? null : cat.id);
    
    // Ejecuta tu lógica de ruteo original
    setSelectedCat(cat.name);
    setSelectedSub("Todos");

    router.push(`/productos?categoria=${encodeURIComponent(cat.name)}`);
  };

  const handleClearAllCategories = () => {
    setOpenCategoryId(null); // Cierra todos los acordeones
    setSelectedCat("Todos");
    setSelectedSub("Todos");
    router.push("/productos");
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Catálogo Completo
            </h1>
            <p className="text-slate-500 mt-2">
              Explora lo último en deporte.
            </p>
          </div>

          {/* ORDENAMIENTO */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <select
                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-accent outline-none cursor-pointer text-teal-400 font-bold"
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
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* SIDEBAR */}
          <aside className="w-full lg:w-64 space-y-8">

            {/* CATEGORÍAS EN ACORDEÓN */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Categorías
              </h3>

              <div className="space-y-2">
                {/* Botón ver todo */}
                <button
                  onClick={handleClearAllCategories}
                  className={`
                    block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors font-semibold
                    ${
                      selectedCat === "Todos"
                        ? "bg-primary text-teal-400 font-medium"
                        : "text-slate-600 hover:bg-slate-100"
                    }
                  `}
                >
                  Todos los productos
                </button>

                {/* Mapeo de Categorías Exclusivas */}
                {categories.map((cat: any) => {
                  const isOpen = openCategoryId === cat.id;
                  const isCurrentCatSelected = selectedCat === cat.name;

                  return (
                    <div key={cat.id} className="space-y-1">
                      
                      {/* Botón Padre de la Categoría */}
                      <button
                        onClick={() => handleCategoryClick(cat)}
                        className={`
                          flex w-full items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group
                          ${
                            isCurrentCatSelected
                              ? "bg-primary text-teal-400 font-medium"
                              : "text-slate-600 hover:bg-slate-100"
                          }
                        `}
                      >
                        <span>{cat.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-teal-400" : ""
                          }`}
                        />
                      </button>

                      {/* Lista de Subcategorías Desplegables Exclusiva */}
                      <AnimatePresence initial={false}>
                        {isOpen && cat.subCategories && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden pl-4 border-l border-slate-200 ml-3 space-y-1"
                          >
                            {/* Ver todo de esta categoría */}
                            <button
                              onClick={() => setSelectedSub("Todos")}
                              className={`
                                block w-full text-left px-3 py-1.5 mt-1 rounded-md text-xs transition-colors
                                ${
                                  isCurrentCatSelected && selectedSub === "Todos"
                                    ? "text-teal-400 font-bold"
                                    : "text-slate-500 hover:text-slate-900"
                                }
                              `}
                            >
                              • Todo {cat.name}
                            </button>

                            {/* Subcategorías hijas */}
                            {cat.subCategories.map((sub: any) => {
                              const isSubActive = isCurrentCatSelected && selectedSub === sub.name;
                              
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => setSelectedSub(sub.name)}
                                  className={`
                                    block w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors
                                    ${
                                      isSubActive
                                        ? "text-teal-400 font-bold"
                                        : "text-slate-500 hover:text-slate-900"
                                    }
                                  `}
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
            </div>
          </aside>

          {/* PRODUCTOS */}
          <div className="flex-1">
            {processedProducts.length > 0 ? (
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <AnimatePresence mode="wait">
                  {processedProducts.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      addToCart={addToCart}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
                <SlidersHorizontal className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">
                  No se encontraron productos con estos filtros.
                </p>
                <button
                  onClick={handleClearAllCategories}
                  className="mt-4 text-accent font-bold hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductsPage;