"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { usePageConfig } from "@/components/providers/PageConfigProvider";

// --- DATOS DE CATEGORÍAS DEL GRID ---
const CATEGORY_GRID = [
  {
    id: "tablas",
    label: "TABLAS",
    sublabel: "Tablas en stock",
    href: "/productos?categoria=tablas",
    image: "/images/new.jpg",
  },
  {
    id: "indumentaria",
    label: "INDUMENTARIA",
    sublabel: "Nuestra colección",
    href: "/productos?categoria=indumentaria",
    image: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=600&q=80",
  },
  {
    id: "trajes",
    label: "TRAJES DE NEOPRENE",
    sublabel: "Trajes en disponibles",
    href: "/productos?categoria=trajes de neopreno",
    image: "/images/products/traje.jpg",
  },
  {
    id: "accesorios",
    label: "ACCESORIOS",
    sublabel: "Killas · Pitas · Grips",
    href: "/productos?categoria=accesorios",
    image: "https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=600&q=80",
  },
  {
    id: "escuela",
    label: "ESCUELA DE SURF",
    sublabel: "Clases",
    href: "/escuela",
    image: "/images/escuela.jpg",
  },
  {
    id: "personalizado",
    label: "Personalizado",
    sublabel: "Diseñá a Medida",
    href: "/personalizado",
    image: "/images/personalizado.jpg",
  },
  {
    id: "arreglos",
    label: "REPARACIONES",
    sublabel: "Reparación y mantenimiento",
    href: "/arreglos",
    image: "/images/arreglos.jpg",
  },
];

// --- TARJETA DE CATEGORÍA (ESTILO CI FLUIDO) ---
const CategoryCard = ({ cat, index, isFullWidth }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={cat.href} passHref legacyBehavior>
      <motion.a
        className={`relative block overflow-hidden cursor-pointer group bg-[#f9f9f9] border border-black/5 transition-colors duration-300 hover:border-black/40 w-full ${
          isFullWidth 
            ? 'aspect-[16/10] md:aspect-[3/1]' 
            : 'aspect-[16/10] md:aspect-square' // Proporción rectangular en mobile para que no ocupe toda la pantalla vertical
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.04 }}
      >
        {/* Imagen de fondo con zoom sutil */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-95 contrast-[1.02]"
          style={{ backgroundImage: `url(${cat.image})` }}
          animate={{ scale: hovered ? 1.03 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Degradado técnico muy suave */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-90" />

        {/* Textos alineados abajo a la izquierda */}
        <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end z-10">
          <p className="text-white text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase mb-2 opacity-80">
            {cat.sublabel}
          </p>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-white font-black text-xl md:text-3xl tracking-[0.05em] uppercase leading-none">
              {cat.label}
            </h3>
            
            {/* Flecha minimalista CI */}
            <div className="overflow-hidden w-6 h-6 flex items-center justify-center">
              <motion.div
                animate={{ x: hovered ? 0 : -25, opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <ArrowRight className="w-6 h-6 text-white stroke-[1.5]" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Overlay rápido al hacer hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </motion.a>
    </Link>
  );
};

// --- COMPONENTE PRINCIPAL (FULL WIDTH) ---
export default function FeaturedSection() {
  const { pageConfig } = usePageConfig();
  
  return (
    <section id="featured" className="w-full bg-white py-16 border-t border-black/5 overflow-hidden">
      {/* Encabezado Editorial */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 mb-10 text-center md:text-left">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 mb-2 block">
          {pageConfig?.location || "SANTA CLARA DEL MAR"}
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-black tracking-[0.03em] uppercase leading-none">
          CATEGORÍAS
        </h2>
        <div className="w-12 h-[2px] bg-black mt-3 mx-auto md:mx-0" />
      </div>

      {/* CONTENEDOR DEL GRID COMPLETAMENTE FLUIDO */}
      <div className="w-full bg-black/5"> 
        
        {/* ── DESKTOP: 2 columnas de punta a punta ── */}
        <div className="hidden md:grid grid-cols-2 gap-[1px]">
          <CategoryCard cat={CATEGORY_GRID[0]} index={0} isFullWidth={false} />
          <CategoryCard cat={CATEGORY_GRID[1]} index={1} isFullWidth={false} />
          <CategoryCard cat={CATEGORY_GRID[2]} index={2} isFullWidth={false} />
          <CategoryCard cat={CATEGORY_GRID[3]} index={3} isFullWidth={false} />
          <CategoryCard cat={CATEGORY_GRID[4]} index={4} isFullWidth={false} />
          <CategoryCard cat={CATEGORY_GRID[5]} index={5} isFullWidth={false} />
          
          {/* Banner inferior extendido */}
          <div className="col-span-2">
            <CategoryCard cat={CATEGORY_GRID[6]} index={6} isFullWidth={true} />
          </div>
        </div>

        {/* ── MOBILE: 1 sola columna de punta a punta (uno abajo del otro) ── */}
        <div className="grid grid-cols-1 gap-[1px] md:hidden">
          {CATEGORY_GRID.map((cat, index) => (
            <CategoryCard 
              key={cat.id} 
              cat={cat} 
              index={index} 
              isFullWidth={true} // En mobile todas toman el comportamiento de ancho completo
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export { FeaturedSection };