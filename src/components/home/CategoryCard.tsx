"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getContrastColor } from "@/lib/utils";
import { useColoresTema } from "@/hooks/use-colores-tema";

export interface CategoriaTarjeta {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  image: string;
  subtitleNeon?: boolean;
  subtitleDim?: boolean;
  linkStyle?: string;
  buttonVariant?: string;
  buttonText?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

interface CategoryCardProps {
  cat: CategoriaTarjeta;
  index: number;
  variant?: 'grid' | 'collage' | 'minimal';
}

export const CategoryCard = ({ cat, index, variant = 'grid' }: CategoryCardProps) => {
  const [hovered, setHovered] = useState(false);
  const { primario } = useColoresTema();

  const variantStyles = variant === 'grid'
    ? "aspect-[3/4] md:aspect-[16/10] max-h-[520px] w-full"
    : variant === 'minimal'
      ? "aspect-[4/3] max-h-[380px]"
      : "h-full min-h-[200px]";

  const subtitleNeon = cat.subtitleNeon || false;
  const subtitleDim = cat.subtitleDim || false;
  const linkStyle = cat.linkStyle || "IMAGE";
  const buttonVariant = cat.buttonVariant || "DEFAULT";
  const buttonText = cat.buttonText || "Ver más";
  const buttonBgColor = cat.buttonBgColor || primario;
  const buttonTextColor = cat.buttonTextColor || getContrastColor(buttonBgColor);

  const neonStyle = subtitleNeon
    ? { textShadow: `0 0 10px ${primario}, 0 0 20px ${primario}80` }
    : {};

  const subtitleEl = cat.sublabel ? (
    <p
      className={subtitleDim
        ? "text-sm text-[var(--texto-sobre-secundario)] opacity-70 mb-2"
        : "text-[10px] font-black tracking-[0.35em] uppercase mb-2"
      }
      style={subtitleDim ? {} : { color: "var(--color-primario)", ...neonStyle }}
    >
      {cat.sublabel}
    </p>
  ) : null;

  const buttonClasses = (() => {
    const base = "px-8 py-3 font-black uppercase tracking-wider text-sm";
    switch (buttonVariant) {
      case "STRAIGHT":
        return `${base} rounded-none`;
      case "TRANSPARENT":
        return `${base} rounded-xl bg-transparent border-2`;
      default:
        return `${base} rounded-xl`;
    }
  })();

  const buttonStyle = buttonVariant === "TRANSPARENT"
    ? { color: buttonTextColor, borderColor: buttonBgColor, backgroundColor: "transparent" }
    : { backgroundColor: buttonBgColor, color: buttonTextColor };

  const content = (
    <motion.div
      className={`relative block overflow-hidden group bg-[var(--color-secundario)] border border-[color-mix(in_srgb,var(--color-secundario)_60%,var(--color-fondo-sitio))] w-full ${variantStyles} ${linkStyle === "IMAGE" ? "cursor-pointer" : ""}`}
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
        <h3 className="text-white font-black text-2xl md:text-3xl tracking-tighter uppercase italic leading-none">
          {cat.label}
        </h3>
        {subtitleEl}

        {linkStyle === "BUTTON" && (
          <div className="mt-4">
            <Link href={cat.href || "#"} className={buttonClasses} style={buttonStyle}>
              {buttonText}
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (linkStyle === "BUTTON") {
    return <div className="w-full">{content}</div>;
  }

  return (
    <Link href={cat.href || "#"}>
      {content}
    </Link>
  );
};
