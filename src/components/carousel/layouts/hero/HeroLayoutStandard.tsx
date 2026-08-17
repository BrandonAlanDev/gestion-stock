"use client";

import { motion } from "framer-motion";
import { Store } from "lucide-react";
import { CarouselSlide } from "../types";
import { resolverEnlaceSlide } from "@/helpers/enlaceSlide";
import HeroCtaButton from "./HeroCtaButton";

export default function HeroLayoutStandard({
  slide,
}: {
  slide: CarouselSlide;
}) {
  return (
    <motion.div
      key={`standard-${slide.id}`}
      className="w-full max-w-3xl mx-0"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {slide.subtitle && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border backdrop-blur-md text-xs uppercase tracking-[0.35em] font-black"
            style={{
              borderColor: "color-mix(in srgb, var(--color-primario) 25%, transparent)",
              color: "var(--color-primario)",
              background: "color-mix(in srgb, var(--color-primario) 6%, transparent)",
            }}
          >
            <Store size={14} />
            {slide.subtitle}
          </span>
        </motion.div>
      )}

      <motion.h1
        className="text-5xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] text-white"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {slide.title}
      </motion.h1>

      {slide.description && (
        <motion.p
          className="mt-8 text-lg md:text-xl text-neutral-300 leading-relaxed max-w-2xl font-light"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {slide.description}
        </motion.p>
      )}

      <HeroCtaButton url={resolverEnlaceSlide(slide) ?? undefined} ctaText={slide.ctaText} hideButton={slide.config?.hideButton} />
    </motion.div>
  );
}
