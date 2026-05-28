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
    href: "/productos?categoria=indumentaria%20",
    image: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=600&q=80",
  },
  {
    id: "trajes",
    label: "TRAJES DE NEOPRENE",
    sublabel: "Trajes en disponibles",
    href: "/productos?categoria=trajes%20de%20neopreno",
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
    image: "/images/shape.jpg",
  },
  {
    id: "arreglos",
    label: "REPARACIONES",
    sublabel: "Reparación y mantenimiento",
    href: "/arreglos",
    image: "/images/arreglos.jpg",
  },
];

// --- TARJETA DE CATEGORÍA (ESTILO CI) ---
const CategoryCard = ({ cat, index, isFullWidth }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={cat.href} passHref legacyBehavior>
      <motion.a
        className={`relative block overflow-hidden cursor-pointer group bg-[#f9f9f9] border border-black/10 transition-colors duration-300 hover:border-black ${
          isFullWidth 
            ? 'aspect-[4/3] md:aspect-[21/7]' 
            : 'aspect-square'
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
          className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-90 contrast-[1.02]"
          style={{ backgroundImage: `url(${cat.image})` }}
          animate={{ scale: hovered ? 1.02 : 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />

        {/* Degradado técnico muy suave, característico de webs minimalistas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80" />

        {/* Textos alineados abajo a la izquierda, limpios y tipográficos */}
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-10">
          <p className="text-white text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase mb-1.5 opacity-80 family-mono">
            {cat.sublabel}
          </p>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-white font-black text-xl md:text-2xl tracking-[0.05em] uppercase leading-none">
              {cat.label}
            </h3>
            
            {/* Flecha minimalista CI (sin círculos pesados) */}
            <div className="overflow-hidden w-5 h-5 flex items-center justify-center">
              <motion.div
                animate={{ x: hovered ? 0 : -20, opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="w-5 h-5 text-white stroke-[1.5]" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Overlay blanco rápido al hacer hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </motion.a>
    </Link>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function FeaturedSection() {
  const { pageConfig } = usePageConfig();
  
  return (
    <section id="featured" className="w-full bg-white py-20 border-t border-black/5">
      {/* Encabezado Editorial */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12 text-center md:text-left">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 mb-3 block">
          {pageConfig?.location || "SANTA CLARA DEL MAR"}
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-black tracking-[0.03em] uppercase leading-none">
          CATEGORÍAS
        </h2>
        <div className="w-12 h-[2px] bg-black mt-4 mx-auto md:mx-0" /> {/* Línea de acento clásica de CI */}
      </div>

      {/* ── DESKTOP: Grilla minimalista limpia de bordes finos ── */}
      <div className="hidden md:grid grid-cols-2 gap-4 max-w-7xl mx-auto px-6 lg:px-8">
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

      {/* ── MOBILE ── */}
      <div className="grid grid-cols-2 gap-2 md:hidden px-4">
        {CATEGORY_GRID.map((cat, index) => {
          const isLast = index === CATEGORY_GRID.length - 1;
          return (
            <div key={cat.id} className={isLast ? "col-span-2" : "col-span-1"}>
              <CategoryCard cat={cat} index={index} isFullWidth={isLast} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export { FeaturedSection };