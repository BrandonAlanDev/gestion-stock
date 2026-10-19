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
}

export default function OfferCard({ image, title, subtitle, discount, buttonText = "Comprar", href, hideButton, hideButtons = false }: OfferCardProps) {
  const CardContent = (
    <motion.div
      className={`group relative h-full w-full overflow-hidden rounded-xl ${href ? "cursor-pointer" : ""}`}
      whileHover={href ? { y: -3 } : undefined}
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
          <div className="flex items-center gap-1 rounded-lg bg-[var(--color-primario)] px-3 py-1.5 text-xs font-semibold text-[var(--texto-sobre-primario)]">
            <span>{discount}% de descuento</span>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute bottom-0 inset-x-0 p-4 md:p-5 z-10">
        <h3 className="mb-1 line-clamp-2 text-lg font-semibold leading-tight tracking-tight text-white md:text-xl">
          {title}
        </h3>
        {subtitle && (
          <p className="text-white/70 text-xs md:text-sm line-clamp-1 mb-3">
            {subtitle}
          </p>
        )}
        {href && !hideButtons && !hideButton && (
          <span
            className="inline-flex min-h-10 items-center rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
          >
            {buttonText}
          </span>
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
