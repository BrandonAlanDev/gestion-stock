"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// --- DATOS DE CATEGORÍAS DEL GRID ---
const CATEGORY_GRID = [
  {
    id: "tablas",
    label: "Tablas",
    sublabel: "Todos nuestros modelos",
    href: "/productos/tablas",
    image: "/images/new.jpg",
    accent: "from-blue-900/80 via-blue-900/40 to-transparent",
  },
  {
    id: "indumentaria",
    label: "Indumentaria",
    sublabel: "Remeras · Jeans · Calzado",
    href: "/productos/indumentaria",
    image: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=600&q=80",
    accent: "from-slate-900/80 via-slate-900/30 to-transparent",
  },
  {
    id: "trajes",
    label: "Trajes",
    sublabel: "Wetsuits · Rashguards",
    href: "/productos/trajes",
    image: "/images/products/traje.jpg",
    accent: "from-cyan-900/80 via-cyan-900/30 to-transparent",
  },
  {
    id: "accesorios",
    label: "Accesorios",
    sublabel: "Quillas · Leashes · Wax",
    href: "/productos/accesorios",
    image: "https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=600&q=80",
    accent: "from-slate-900/80 via-slate-900/30 to-transparent",
  },
  {
    id: "escuela",
    label: "Escuela de Surf",
    sublabel: "Clases · Niveles · Paquetes",
    href: "/escuela",
    image: "/images/escuela.jpg",
    accent: "from-teal-900/80 via-teal-900/30 to-transparent",
  },
  {
    id: "personalizado",
    label: "Personalizado",
    sublabel: "Diseños a medida · Custom boards",
    href: "/personalizado",
    image: "/images/shape.jpg",
    accent: "from-indigo-900/80 via-indigo-900/30 to-transparent",
  },
  {
    id: "arreglos",
    label: "Arreglos",
    sublabel: "Reparaciones · Mantenimiento",
    href: "/arreglos",
    image: "/images/arreglos.jpg",
    accent: "from-orange-900/80 via-orange-900/30 to-transparent",
  },
];

// --- TARJETA DE CATEGORÍA ---
const CategoryCard = ({ cat, index, tall }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={cat.href} passHref legacyBehavior>
      <motion.a
        className={`relative block overflow-hidden cursor-pointer group ${tall ? 'h-full' : 'h-[42vw]'}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${cat.image})` }}
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${cat.accent} transition-opacity duration-300`} />
        <motion.div
          className="absolute inset-0 bg-slate-900/20"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <motion.p
            className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-1"
            animate={{ opacity: hovered ? 1 : 0.7, y: hovered ? 0 : 4 }}
            transition={{ duration: 0.3 }}
          >
            {cat.sublabel}
          </motion.p>
          <div className="flex items-end justify-between">
            <h3 className="text-white font-bold text-xl md:text-2xl tracking-tight leading-tight">
              {cat.label}
            </h3>
            <motion.div
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm"
              animate={{
                x: hovered ? 0 : 6,
                opacity: hovered ? 1 : 0,
                backgroundColor: hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.1)'
              }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className={`w-4 h-4 ${hovered ? 'text-slate-900' : 'text-white'}`} />
            </motion.div>
          </div>
        </div>
        <motion.div
          className="absolute inset-0 border-2 border-white/20"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.a>
    </Link>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function FeaturedSection() {
  return (
    <section id="featured" className="w-full py-16">
      {/* Encabezado */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-2 block">
            Santa Clara del Mar
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Somos NEWSURFBOARD
          </h2>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-3 grid-rows-3 gap-[2px] h-[80vh] px-4 sm:px-6 lg:px-8">

        {/* div1 — Tablas: col 1, rows 1-2 */}
        <div className="row-span-2 col-start-1 row-start-1">
          <CategoryCard cat={CATEGORY_GRID[0]} index={0} tall />
        </div>

        {/* div2 — Indumentaria: col 2, row 1 */}
        <div className="col-start-2 row-start-1">
          <CategoryCard cat={CATEGORY_GRID[1]} index={1} tall />
        </div>

        {/* div4 — Trajes: col 2, row 2 */}
        <div className="col-start-2 row-start-2">
          <CategoryCard cat={CATEGORY_GRID[2]} index={2} tall />
        </div>

        {/* div5 — Accesorios: col 1, row 3 */}
        <div className="col-start-1 row-start-3">
          <CategoryCard cat={CATEGORY_GRID[3]} index={3} tall />
        </div>

        {/* div6 — Escuela: col 2, row 3 */}
        <div className="col-start-2 row-start-3">
          <CategoryCard cat={CATEGORY_GRID[4]} index={4} tall />
        </div>

        {/* div9 — Personalizado: col 3, row 1 */}
        <div className="col-start-3 row-start-1">
          <CategoryCard cat={CATEGORY_GRID[5]} index={5} tall />
        </div>

        {/* div10 — Arreglos: col 3, rows 2-3 */}
        <div className="row-span-2 col-start-3 row-start-2">
          <CategoryCard cat={CATEGORY_GRID[6]} index={6} tall />
        </div>

      </div>

      {/* ── MOBILE: 2 columnas full width ── */}
      <div className="grid grid-cols-2 gap-[2px] md:hidden px-4">
        {CATEGORY_GRID.map((cat, index) => (
          <CategoryCard key={cat.id} cat={cat} index={index} />
        ))}
      </div>
    </section>
  );
}

export { FeaturedSection };