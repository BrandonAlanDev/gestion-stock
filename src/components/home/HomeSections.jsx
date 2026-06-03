"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { usePageConfig } from "@/components/providers/PageConfigProvider";

// --- DATOS DE CATEGORÍAS (ESTILO EDITORIAL ADIDAS) ---
const CATEGORY_GRID = [
  {
    id: "hombre",
    label: "HOMBRE",
    sublabel: "Estilo y rendimiento urbano",
    href: "/productos?categoria=hombre",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80",
  },
  {
    id: "mujer",
    label: "MUJER",
    sublabel: "Diseño sin límites",
    href: "/productos?categoria=mujer",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
  },
  {
    id: "calzado",
    label: "CALZADO",
    sublabel: "Iconos de la cultura sneaker",
    href: "/productos?categoria=calzado",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80",
  },
  {
    id: "deporte",
    label: "DEPORTE",
    sublabel: "Equipamiento de alto nivel",
    href: "/productos?categoria=deporte",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80",
  },
  {
    id: "nino",
    label: "NIÑO",
    sublabel: "Comodidad para dar sus primeros pasos",
    href: "/productos?categoria=nino",
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=1200&q=80",
  },
];

// --- TARJETA DE CATEGORÍA (EDITORIAL ADIDAS SNEAKERS) ---
const CategoryCard = ({ cat, index, className = "" }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={cat.href} passHref legacyBehavior>
      <motion.a
        className={`relative block overflow-hidden cursor-pointer group bg-neutral-100 w-full shadow-md hover:shadow-2xl transition-all duration-500 border border-neutral-900/5 ${className}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Imagen de fondo limpia con zoom controlado al hacer hover */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${cat.image})` }}
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        />

        {/* Overlay oscuro plano - Adidas prefiere contraste abajo para legibilidad de marca */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/95" />

        {/* Contenido Editorial de la Tarjeta */}
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-10">
          
          <h3 className="text-white font-black text-2xl md:text-4xl tracking-tighter uppercase italic leading-none mb-1">
            {cat.label}
          </h3>
          
          <p className="text-white/80 text-[11px] md:text-xs font-medium tracking-wide uppercase mb-4 max-w-[85%]">
            {cat.sublabel}
          </p>
          
          {/* Botón de acción estilo Adidas Link (Fondo blanco, texto negro, rígido) */}
          <div className="inline-flex items-center gap-3 bg-white text-black text-xs font-black uppercase tracking-widest px-4 py-3 w-fit transition-all duration-300 group-hover:bg-cyan-400 group-hover:text-black">
            <span>Ver Ahora</span>
            <motion.div
              animate={{ x: hovered ? 4 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </motion.div>
          </div>
        </div>

        {/* Marcador técnico opcional de página / estilo revista */}
        <div className="absolute top-4 right-4 text-white/20 text-[10px] font-black tracking-widest hidden md:block">
          [0{index + 1}]
        </div>
      </motion.a>
    </Link>
  );
};

// --- COMPONENTE PRINCIPAL (FEATURED SECTION) ---
export default function FeaturedSection() {
  const { pageConfig } = usePageConfig();
  
  return (
    <section id="featured" className="w-full bg-white py-16 md:py-28 border-t border-neutral-200 overflow-hidden">
      
      {/* Encabezado Principal de Campaña (Estilo Editorial) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b-2 border-black pb-6">
          <div>
            <span className="text-[11px] font-black tracking-[0.4em] text-neutral-400 uppercase block mb-2">
              {pageConfig?.location || "EDICIÓN LIMITADA"}
            </span>
            <h2 className="text-5xl md:text-7xl font-black text-black tracking-tight uppercase italic leading-none">
              NUESTRO <br className="hidden md:block"/>CATÁLOGO
            </h2>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <Link 
              href="/productos" 
              className="text-xs font-black uppercase tracking-widest text-black hover:text-cyan-500 underline underline-offset-4 transition-colors mt-2"
            >
              Ver todo el catálogo completo
            </Link>
          </div>
        </div>
      </div>

      {/* CONTENEDOR COLLAGE ASIMÉTRICO */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
        
        {/* ── DESKTOP: Grid de Revista Asimétrico (Rompiendo líneas continuas) ── */}
        <div className="hidden md:grid grid-cols-12 gap-6 items-start">
          
          {/* Bloque 1: Hombre (Ocupa 8 col, estirado verticalmente) */}
          <div className="col-span-8">
            <CategoryCard cat={CATEGORY_GRID[0]} index={0} className="aspect-[16/11]" />
          </div>

          {/* Bloque 2: Mujer (Ocupa 4 col, descalzado hacia abajo con margen superior) */}
          <div className="col-span-4 md:mt-16">
            <CategoryCard cat={CATEGORY_GRID[1]} index={1} className="aspect-[3/4]" />
          </div>

          {/* Bloque 3: Calzado (Ocupa 5 col, metido ligeramente hacia arriba gracias al descalce del anterior) */}
          <div className="col-span-5 md:-mt-8">
            <CategoryCard cat={CATEGORY_GRID[2]} index={2} className="aspect-[4/5]" />
          </div>

          {/* Bloque 4: Deporte (Ocupa 7 col, formato apaisado técnico para contrastar con el vertical de al lado) */}
          <div className="col-span-7">
            <CategoryCard cat={CATEGORY_GRID[3]} index={3} className="aspect-[16/9]" />
          </div>
          
          {/* Bloque 5: Niño (Banner gigante descentrado de cierre, rompe ocupando 10 columnas en vez de las 12) */}
          <div className="col-span-11 col-start-2 md:mt-8">
            <CategoryCard cat={CATEGORY_GRID[4]} index={4} className="aspect-[21/8]" />
          </div>

        </div>

        {/* ── MOBILE: Mantiene flujo ordenado pero cómodo para scroll manual ── */}
        <div className="grid grid-cols-1 gap-6 md:hidden">
          {CATEGORY_GRID.map((cat, index) => (
            <CategoryCard 
              key={cat.id} 
              cat={cat} 
              index={index} 
              className="aspect-[4/3] odd:rotate-[-0.5deg] even:rotate-[0.5deg]" // Mini imperfección de rotación simulando recortes de revista en mobile
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export { FeaturedSection };