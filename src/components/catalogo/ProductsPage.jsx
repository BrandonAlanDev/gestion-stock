import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { products, categories } from './data';
import  ProductCard  from './ProductCard'; // Extraeremos el card a un componente

const ProductsPage = ({ addToCart }) => {
  const [selectedCat, setSelectedCat] = useState("Todos");
  const [selectedSub, setSelectedSub] = useState("Todos");
  const [sortConfig, setSortConfig] = useState({ key: 'date', order: 'desc' });

  // Lógica de Filtrado y Ordenamiento
  const processedProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchCat = selectedCat === "Todos" || p.category === selectedCat;
      const matchSub = selectedSub === "Todos" || p.subcategory === selectedSub;
      return matchCat && matchSub;
    });

    return filtered.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === 'date') {
        valA = new Date(valA);
        valB = new Date(valB);
      }

      if (sortConfig.order === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
  }, [selectedCat, selectedSub, sortConfig]);

  const activeCategoryData = categories.find(c => c.name === selectedCat);

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header de la Página */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Catálogo Completo</h1>
            <p className="text-slate-500 mt-2">Explora lo último en deporte.</p>
          </div>
          
          {/* Controles de Ordenamiento */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <select 
                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:ring-2 focus:ring-accent outline-none cursor-pointer"
                onChange={(e) => {
                  const [key, order] = e.target.value.split('-');
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
          {/* Sidebar de Filtros */}
          <aside className="w-full lg:w-64 space-y-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Categorías
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => { setSelectedCat("Todos"); setSelectedSub("Todos"); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCat === "Todos" ? "bg-primary text-white font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  Todos los productos
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => { setSelectedCat(cat.name); setSelectedSub("Todos"); }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCat === cat.name ? "bg-primary text-white font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategorías Dinámicas */}
            {selectedCat !== "Todos" && activeCategoryData?.subcategories && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Subcategoría</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setSelectedSub("Todos")}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedSub === "Todos" ? "bg-accent text-white font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    Cualquiera
                  </button>
                  {activeCategoryData.subcategories.map(sub => (
                    <button 
                      key={sub}
                      onClick={() => setSelectedSub(sub)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedSub === sub ? "bg-accent text-white font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </aside>

          {/* Grilla de Productos */}
          <div className="flex-1">
            {processedProducts.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {processedProducts.map(product => (
                    <ProductCard key={product.id} product={product} addToCart={addToCart} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
                <SlidersHorizontal className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">No se encontraron productos con estos filtros.</p>
                <button onClick={() => {setSelectedCat("Todos"); setSelectedSub("Todos");}} className="mt-4 text-accent font-bold hover:underline">Limpiar filtros</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;