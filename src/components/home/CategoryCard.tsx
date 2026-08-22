"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  cat: {
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

  const subtitleNeon = cat.subtitleNeon || false;
  const subtitleDim = cat.subtitleDim || false;
  const linkStyle = cat.linkStyle || "IMAGE";
  const buttonVariant = cat.buttonVariant || "DEFAULT";
  const buttonText = cat.buttonText || "Ver más";
  const buttonBgColor = cat.buttonBgColor || primaryColor;
  const buttonTextColor = cat.buttonTextColor || "#ffffff";

  const neonStyle = subtitleNeon
    ? { textShadow: `0 0 10px ${primaryColor}, 0 0 20px ${primaryColor}80` }
    : {};

  const subtitleEl = cat.sublabel ? (
    <p
      className={subtitleDim
        ? "text-sm text-gray-400/70 mb-2"
        : "text-[10px] font-black tracking-[0.35em] uppercase mb-2"
      }
      style={subtitleDim ? {} : { color: primaryColor, ...neonStyle }}
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
      className={`relative block overflow-hidden group bg-neutral-100 border border-neutral-200/40 w-full ${variantStyles} ${linkStyle === "IMAGE" ? "cursor-pointer" : ""}`}
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
            <Link href={cat.href || "#"} passHref legacyBehavior>
              <a className={buttonClasses} style={buttonStyle}>
                {buttonText}
              </a>
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
    <Link href={cat.href || "#"} passHref legacyBehavior>
      {content}
    </Link>
  );
};
