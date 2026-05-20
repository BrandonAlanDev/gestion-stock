"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// --- DATOS DE CATEGORÍAS DEL GRID ---
const CATEGORY_GRID = [
  {
    id: "tablas",
    label: "Tablas",
    sublabel: "Todos nuestros modelos",
    href: "/productos?categoria=tablas",
    image: "/images/products/tablas.jpg",
    accent: "from-blue-900/80 via-blue-900/40 to-transparent",
  },
  {
    id: "indumentaria",
    label: "Indumentaria",
    sublabel: "Remeras · Shorts · Calzado",
    href: "/productos?categoria=indumentaria",
    image: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=600&q=80",
    accent: "from-slate-900/80 via-slate-900/30 to-transparent",
  },
  {
    id: "trajes",
    label: "Trajes",
    sublabel: "Wetsuits · Rashguards",
    href: "/productos?categoria=trajes",
    image: "/images/products/traje.jpg",
    accent: "from-cyan-900/80 via-cyan-900/30 to-transparent",
  },
  {
    id: "accesorios",
    label: "Accesorios",
    sublabel: "Quillas · Leashes · Wax",
    href: "/productos?categoria=accesorios",
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
];


// --- TARJETA DE CATEGORÍA ---
const CategoryCard = ({ cat, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={cat.href}
      className="relative overflow-hidden rounded-2xl cursor-pointer group h-[260px] sm:h-[280px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Imagen de fondo con zoom al hover */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${cat.image})` }}
        animate={{ scale: hovered ? 1.07 : 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Gradiente superpuesto */}
      <div className={`absolute inset-0 bg-gradient-to-t ${cat.accent} transition-opacity duration-300`} />

      {/* Capa oscura adicional al hover */}
      <motion.div
        className="absolute inset-0 bg-slate-900/20"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Contenido */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
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

      {/* Borde sutil al hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-white/20"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.a>
  );
};

// --- COMPONENTE AUXILIAR: BOTÓN CON DESPLEGABLE ---
const CategoryDropdown = ({ cat, activeCategory, setActiveCategory, setActiveSubcategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  const isSelected = activeCategory === cat.name;

  return (
    <motion.a
      href={cat.href}
      className="relative overflow-hidden rounded-2xl cursor-pointer group h-[260px] sm:h-[280px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Imagen de fondo con zoom al hover */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${cat.image})` }}
        animate={{ scale: hovered ? 1.07 : 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Gradiente superpuesto */}
      <div className={`absolute inset-0 bg-gradient-to-t ${cat.accent} transition-opacity duration-300`} />

      {/* Capa oscura adicional al hover */}
      <motion.div
        className="absolute inset-0 bg-slate-900/20"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Contenido */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
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

      {/* Borde sutil al hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-white/20"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.a>
  );
};

// --- COMPONENTE: SECCIÓN DESTACADA ---
export const FeaturedSection = ({ activeCategory, setActiveCategory }) => {
  return (
    <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-blue-500 mb-2 block">
            Santa Clara del Mar
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Somos NEWSURFBOARD
          </h2>
        </div>
      </div>

      {/* Grid: 1 col en mobile, 2 col en sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CATEGORY_GRID.map((cat, index) => (
          <CategoryCard key={cat.id} cat={cat} index={index} />
        ))}
      </div>
    </section>
  );
};