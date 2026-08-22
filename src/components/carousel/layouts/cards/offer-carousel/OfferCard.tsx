"use client";

import { motion } from "framer-motion";

interface OfferCardProps {
  image: string;
  title: string;
  subtitle?: string;
  discount?: number;
  buttonText?: string;
  href?: string;
  hideButton?: boolean;
  hideButtons?: boolean;
  primaryColor?: string;
}

export default function OfferCard({ image, title, subtitle, discount, buttonText = "Comprar", href, hideButton, hideButtons = false, primaryColor = "#06b6d4" }: OfferCardProps) {
  const CardContent = (
    <motion.div
      className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {discount && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-black text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1">
            <span>🔥</span>
            <span>{discount}% OFF</span>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />

      <div className="absolute bottom-0 inset-x-0 p-4 md:p-5 z-10">
        <h3 className="text-white font-black text-lg md:text-xl tracking-tight leading-tight mb-1 line-clamp-2">
          {title}
        </h3>
        {subtitle && (
          <p className="text-white/70 text-xs md:text-sm line-clamp-1 mb-3">
            {subtitle}
          </p>
        )}
        {!hideButtons && !hideButton && (
          <motion.button
            type="button"
            className="px-4 py-1.5 md:px-5 md:py-2 rounded-lg text-xs md:text-sm font-black uppercase tracking-wider transition-colors"
            style={{ backgroundColor: "#ffffff", color: "#1a1a1a" }}
            whileHover={{ backgroundColor: primaryColor, color: "#ffffff" }}
            transition={{ duration: 0.2 }}
          >
            {buttonText}
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="block w-full h-full" target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
        {CardContent}
      </a>
    );
  }

  return CardContent;
}
