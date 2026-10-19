"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { obtenerColorContraste as getContrastColor } from "@/lib/utilidades/obtener-color-contraste";
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
    const base = "inline-flex min-h-11 items-center px-5 py-2.5 text-sm font-semibold";
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
      className={`group relative block w-full overflow-hidden rounded-xl border border-current/10 bg-[var(--color-secundario)] ${variantStyles} ${linkStyle === "IMAGE" ? "cursor-pointer" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
        style={{ backgroundImage: `url(${cat.image})` }}
        animate={{ scale: hovered ? 1.04 : 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-8">
        <h3 className="text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl">
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
