"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePageConfig } from "@/components/providers/PageConfigProvider";

const CATEGORY_GRID = [
  { id: "tablas", label: "TABLAS", sublabel: "Tablas en stock", href: "/productos?categoria=tablas", image: "/images/tablas.jpg" },
  { id: "indumentaria", label: "INDUMENTARIA", sublabel: "Nuestra colección", href: "/productos?categoria=indumentaria", image: "/images/products/Indumentaria.jpeg" },
  { id: "trajes", label: "TRAJES DE NEOPRENE", sublabel: "Trajes disponibles", href: "/productos?categoria=trajes de neopreno", image: "/images/products/Neoprenos.jpeg" },
  { id: "accesorios", label: "ACCESORIOS", sublabel: "Quillas · Pitas · Grips", href: "/productos?categoria=accesorios", image: "https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=1200&q=80" },
  { id: "escuela", label: "ESCUELA DE SURF", sublabel: "Clases y Clínicas", href: "/escuela", image: "/images/products/Escuelasurf.jpeg" },
  { id: "personalizado", label: "CUSTOM WORK", sublabel: "Diseñá a Medida", href: "/personalizado", image: "/images/products/CustomWorks.jpeg" },
  { id: "arreglos", label: "REPARACIONES", sublabel: "Taller técnico y mantenimiento", href: "/page/?title=Reparaciones", image: "/images/arreglos.jpg" },
  { id: "plan-ahorro", label: "PLAN DE AHORRO", sublabel: "Financiación adjudicada y cuotas fijas", href: "/plan-de-ahorro", image: "/images/ahorro.jpg" },
];

const CategoryCard = ({ cat, index, primaryColor }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={cat.href} passHref legacyBehavior>
      <motion.a
        className="relative block overflow-hidden cursor-pointer group bg-neutral-100 border border-neutral-200/40 w-full h-[50vh] md:h-[70vh] lg:h-[80vh]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.02 }}
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center grayscale-[15%] group-hover:grayscale-0 transition-all duration-1000"
          style={{ backgroundImage: `url(${cat.image})` }}
          animate={{ scale: hovered ? 1.04 : 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-95 group-hover:via-black/35 transition-all duration-300" />

        <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-end z-10">
          <p className="text-xs font-black tracking-[0.35em] uppercase mb-2" style={{ color: primaryColor }}>
            // {cat.sublabel}
          </p>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-white font-black text-2xl md:text-4xl tracking-tighter uppercase leading-none italic">
              {cat.label}
            </h3>
          </div>
        </div>
      </motion.a>
    </Link>
  );
};

export default function FeaturedSection() {
  const { pageConfig } = usePageConfig();
  const primaryColor = pageConfig?.primaryColor || "#06b6d4";

  return (
    <section id="featured" className="w-full bg-white py-16 border-t-2" style={{ borderColor: primaryColor }}>
      <div className="w-full px-4 md:px-12 lg:px-16 mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b-2 pb-6" style={{ borderColor: primaryColor }}>
          <div>
            <span className="text-[10px] font-black tracking-[0.4em] text-neutral-400 uppercase block mb-1">
              {pageConfig?.location || "SANTA CLARA DEL MAR"}
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-black tracking-tighter uppercase italic leading-none">
              CATALOGO Y SERVICIOS
            </h2>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {CATEGORY_GRID.map((cat, index) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              index={index}
              primaryColor={primaryColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export { FeaturedSection };