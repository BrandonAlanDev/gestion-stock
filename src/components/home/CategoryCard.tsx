"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CategoryCardProps {
  cat: {
    id: string;
    label: string;
    sublabel: string;
    href: string;
    image: string;
  };
  index: number;
  primaryColor: string;
  variant?: 'grid' | 'collage' | 'minimal';
}

export const CategoryCard = ({ cat, index, primaryColor, variant = 'grid' }: CategoryCardProps) => {
  const [hovered, setHovered] = useState(false);

  const variantStyles = variant === 'grid' 
    ? "h-[60vh] md:h-[80vh] min-h-[400px]" 
    : variant === 'minimal'
      ? "h-[40vh] min-h-[300px]"
      : "h-full min-h-[250px]";

  return (
    <Link href={cat.href || "#"} passHref legacyBehavior>
      <motion.a
        className={`relative block overflow-hidden cursor-pointer group bg-neutral-100 border border-neutral-200/40 w-full ${variantStyles}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center grayscale-[15%] group-hover:grayscale-0 transition-all duration-1000"
          style={{ backgroundImage: `url(${cat.image})` }}
          animate={{ scale: hovered ? 1.04 : 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-95 group-hover:via-black/35 transition-all duration-300" />

        <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end z-10">
          <p className="text-[10px] font-black tracking-[0.35em] uppercase mb-2" style={{ color: primaryColor }}>
            {cat.sublabel}
          </p>
          <h3 className="text-white font-black text-2xl md:text-3xl tracking-tighter uppercase italic leading-none">
            {cat.label}
          </h3>
        </div>
      </motion.a>
    </Link>
  );
};