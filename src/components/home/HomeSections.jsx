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
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=80", // Subido de resolución para pantalla completa
  },
  {
    id: "mujer",
    label: "MUJER",
    sublabel: "Diseño sin límites",
    href: "/productos?categoria=mujer",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80",
  },
  {
    id: "calzado",
    label: "CALZADO",
    sublabel: "Iconos de la cultura sneaker",
    href: "/productos?categoria=calzado",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200&q=80",
  },
  {
    id: "deporte",
    label: "DEPORTE",
    sublabel: "Equipamiento de alto nivel",
    href: "/productos?categoria=deporte",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&q=80",
  },
  {
    id: "nino",
    label: "NIÑO",
    sublabel: "Comodidad para dar sus primeros pasos",
    href: "/productos?categoria=nino",
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=1600&q=80",
  },
];

// --- TARJETA DE CATEGORÍA ---
const CategoryCard = ({ cat, index, className = "" }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={cat.href} passHref legacyBehavior>
      <motion.a
        className={`relative block overflow-hidden cursor-pointer group bg-neutral-900 w-full transition-all duration-500 border border-neutral-800 ${className}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Imagen de fondo con zoom controlado */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${cat.image})` }}
          animate={{ scale: hovered ? 1.03 : 1 }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        />

        {/* Overlay oscuro para contraste rudo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300 group-hover:via-black/50" />

        {/* Contenido Editorial */}
        <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end z-10">
          <h3 className="text-white font-black text-3xl md:text-5xl tracking-tighter uppercase italic leading-none mb-1">
            {cat.label}
          </h3>
          
          <p className="text-neutral-400 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-5 max-w-[85%]">
            {cat.sublabel}
          </p>
          
          {/* Botón rígido industrial */}
          <div className="inline-flex items-center gap-3 bg-white text-black text-[11px] font-black uppercase tracking-widest px-5 py-3 w-fit transition-all duration-300 group-hover:bg-cyan-400 group-hover:text-black">
            <span>VER AHORA</span>
            <motion.div
              animate={{ x: hovered ? 4 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </motion.div>
          </div>
        </div>

        {/* Marcador técnico */}
        <div className="absolute top-4 right-4 text-white/10 text-[10px] font-black tracking-widest hidden md:block">
          // 0{index + 1}
        </div>
      </motion.a>
    </Link>
  );
};

// --- COMPONENTE PRINCIPAL (FEATURED SECTION - FULL SCREEN) ---
export default function FeaturedSection() {
  const { pageConfig } = usePageConfig();
  
  return (
    <section id="featured" className="w-full bg-black py-16 md:py-24 border-t border-neutral-900 overflow-hidden">
      
      {/* Encabezado sin límites max-w-7xl, usando paddings anchos fluidos */}
      <div className="w-full px-4 md:px-12 lg:px-16 mb-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-neutral-800 pb-6">
          <div>
            <span className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase block mb-2">
              {pageConfig?.location || "EDICIÓN LIMITADA // DROP SELECT"}
            </span>
            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.85]">
              NUESTRO <br />CATÁLOGO
            </h2>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <Link 
              href="/productos" 
              className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-cyan-400 transition-colors mt-2 border border-neutral-800 px-4 py-2 hover:border-cyan-400/30"
            >
              VER CATÁLOGO COMPLETO
            </Link>
          </div>
        </div>
      </div>

      {/* CONTENEDOR COLLAGE ASIMÉTRICO EXPANDIDO */}
      <div className="w-full px-4 md:px-12 lg:px-16"> 
        
        {/* GRID DESKTOP BORDE A BORDE */}
        <div className="hidden md:grid grid-cols-12 gap-4 items-start">
          
          {/* Bloque 1: Hombre */}
          <div className="col-span-8">
            <CategoryCard cat={CATEGORY_GRID[0]} index={0} className="aspect-[16/10]" />
          </div>

          {/* Bloque 2: Mujer */}
          <div className="col-span-4 md:mt-12">
            <CategoryCard cat={CATEGORY_GRID[1]} index={1} className="aspect-[3/4]" />
          </div>

          {/* Bloque 3: Calzado */}
          <div className="col-span-5 md:-mt-16">
            <CategoryCard cat={CATEGORY_GRID[2]} index={2} className="aspect-[4/5]" />
          </div>

          {/* Bloque 4: Deporte */}
          <div className="col-span-7">
            <CategoryCard cat={CATEGORY_GRID[3]} index={3} className="aspect-[16/8.5]" />
          </div>
          
          {/* Bloque 5: Niño — Ocupa las 12 columnas nativas eliminando márgenes vacíos de reojo */}
          <div className="col-span-12 md:mt-4">
            <CategoryCard cat={CATEGORY_GRID[4]} index={4} className="aspect-[21/7]" />
          </div>

        </div>

        {/* MOBILE GRID */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {CATEGORY_GRID.map((cat, index) => (
            <CategoryCard 
              key={cat.id} 
              cat={cat} 
              index={index} 
              className="aspect-[4/3]" 
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export { FeaturedSection };