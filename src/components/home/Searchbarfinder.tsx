'use client'

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Image as ImageIcon, FileText, LayoutGrid, Layers, X } from 'lucide-react';
import { getGlobalSearchIndex, type SearchItem } from '@/actions/search';
import { usePageConfig } from "@/components/providers/PageConfigProvider";

export default function Searchbarfinder({ isHomeTop }: { isHomeTop: boolean }) {
  const { pageConfig: rawConfig } = usePageConfig();
  const config = (rawConfig?.pageConfig ?? rawConfig) as Record<string, unknown>;

  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isTransparentState = isHomeTop && !isFocused;
  const currentTextColor = isTransparentState ? "var(--texto-sobre-fondo)" : "var(--texto-sobre-secundario)";
  const overlayColor = "color-mix(in srgb, var(--texto-sobre-secundario) 8%, transparent)";

  // Fondo de la barra de búsqueda
  const inputBgColor = isTransparentState
    ? "color-mix(in srgb, var(--texto-sobre-fondo) 12%, transparent)"
    : "var(--color-secundario)";

  const dropdownBg = "var(--color-secundario)";

  const placeholderClass = isTransparentState
    ? "placeholder-[var(--texto-sobre-fondo)] placeholder-opacity-90"
    : "placeholder-[var(--texto-sobre-secundario)] placeholder-opacity-60";

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadIndex() {
      const cached = sessionStorage.getItem('searchIndexCache');
      if (cached) {
        setIndex(JSON.parse(cached));
        return;
      }
      setIsLoading(true);
      const data = await getGlobalSearchIndex();
      setIndex(data);
      sessionStorage.setItem('searchIndexCache', JSON.stringify(data));
      setIsLoading(false);
    }
    loadIndex();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    const searchStr = query.toLowerCase();
    const staticLinks: SearchItem[] = [
      { id: 'home', type: 'page', title: 'Inicio / Home', url: '/' },
      { id: 'catalogo', type: 'page', title: 'Catálogo de Productos', url: '/productos' },
    ];

    if (config?.escuelaEnabled === true) {
      staticLinks.push({ id: 'escuela', type: 'page', title: 'Escuela de Surf', url: '/escuela' });
    }
    if (config?.personalizadoEnabled === true) {
      staticLinks.push({ id: 'personalizado', type: 'page', title: 'Trabajos Personalizados', url: '/personalizado' });
    }

    const combined = [...staticLinks, ...index];
    
    return combined
      .filter(item => item.title.toLowerCase().includes(searchStr))
      .slice(0, 8);
  }, [query, index, config]);

  const getIconForType = (type: string) => {
    const iconProps = { className: "w-5 h-5", style: { color: "var(--texto-sobre-secundario)" } };
    switch (type) {
      case 'category': return <LayoutGrid {...iconProps} />;
      case 'subcategory': return <Layers {...iconProps} />;
      case 'page': return <FileText {...iconProps} />;
      case 'product': return <ImageIcon {...iconProps} />;
      default: return <Search {...iconProps} />;
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 w-full max-w-[200px] sm:max-w-md lg:max-w-2xl mx-3 sm:mx-6 z-50">
      
      {/* Search Input */}
      <div
        className={`relative flex items-center w-full h-10 sm:h-11 rounded-xl transition-all duration-300 backdrop-blur-md ${
           !isTransparentState ? 'border' : 'border-transparent'
        }`}
        style={{
          backgroundColor: isFocused ? "var(--color-secundario)" : inputBgColor, 
          borderColor: isFocused ? overlayColor : (isTransparentState ? 'transparent' : overlayColor),
          boxShadow: isFocused ? "0 0 0 1px color-mix(in srgb, var(--color-primario) 20%, transparent)" : undefined,
        }}
      >
        <div 
          className="grid place-items-center h-full w-10 sm:w-12 transition-colors flex-shrink-0"
          style={{ color: currentTextColor }}
        >
          <Search size={18} />
        </div>
        
        <input
          className={`peer h-full w-full outline-none text-xs sm:text-sm bg-transparent pr-2 transition-colors ${placeholderClass}`}
          type="text"
          id="search"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          autoComplete="off"
          style={{ 
            color: currentTextColor,
          }}
        />

        {query && (
          <button 
            onClick={() => { setQuery(''); setIsFocused(true); }}
            className="grid place-items-center h-full w-10 sm:w-12 flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
            style={{ color: currentTextColor }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Accordion / Dropdown Popup */}
      {isFocused && query.trim().length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border overflow-hidden flex flex-col max-h-[60vh] sm:max-h-[400px] overflow-y-auto backdrop-blur-xl transition-all"
          style={{
            backgroundColor: dropdownBg,
            borderColor: overlayColor
          }}
        >
          {isLoading && index.length === 0 ? (
            <div className="p-4 text-center text-xs font-medium" style={{ color: "var(--texto-sobre-secundario)", opacity: 0.6 }}>
              Buscando resultados...
            </div>
          ) : filteredResults.length > 0 ? (
            <ul className="py-2">
              {filteredResults.map((item) => (
                <li key={item.id}>
                  <Link 
                    href={item.url}
                    onClick={() => setIsFocused(false)} 
                    className="flex items-center px-4 py-2.5 transition-colors gap-3 group hover:bg-[color-mix(in_srgb,var(--texto-sobre-secundario)_8%,transparent)]"
                  >
                    <div 
                      className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center border"
                      style={{ 
                        backgroundColor: overlayColor,
                        borderColor: overlayColor
                      }}
                    >
                      {item.imageUrl ? (
                        <Image 
                          src={item.imageUrl} 
                          alt={item.title} 
                          width={40} 
                          height={40} 
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div style={{ opacity: 0.7 }}>
                          {getIconForType(item.type)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col overflow-hidden">
                      <span 
                        className="text-sm font-bold truncate transition-colors group-hover:opacity-80" 
                        style={{ color: "var(--texto-sobre-secundario)" }}
                      >
                        {item.title}
                      </span>
                      <span 
                        className="text-[10px] font-medium uppercase tracking-wider opacity-60"
                        style={{ color: "var(--texto-sobre-secundario)" }}
                      >
                        {item.type === 'page' ? 'Página' : 
                         item.type === 'product' ? 'Producto' : 
                         item.type === 'category' ? 'Categoría' : 'Subcategoría'}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-xs font-medium" style={{ color: "var(--texto-sobre-secundario)", opacity: 0.6 }}>
              No encontramos nada para &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
