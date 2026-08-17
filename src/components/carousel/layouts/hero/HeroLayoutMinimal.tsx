"use client";

import { motion } from "framer-motion";
import { Store } from "lucide-react";
import { CarouselSlide } from "../types";
import { resolverEnlaceSlide } from "@/helpers/enlaceSlide";
import HeroCtaButton from "./HeroCtaButton";

export default function HeroLayoutMinimal({
  slide,
}: {
  slide: CarouselSlide;
}) {
  return (
    <motion.div
      key={`minimal-${slide.id}`}
      className="w-full max-w-5xl text-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {slide.subtitle && (
        <motion.p
          className="text-xs font-black tracking-[0.35em] uppercase mb-4"
          style={{ color: "var(--color-primario)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Store className="inline-block w-4 h-4 mr-2 align-middle" /> {slide.subtitle}
        </motion.p>
      )}

      <motion.h1
        className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase italic leading-none mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {slide.title}
      </motion.h1>

      {slide.description && (
        <motion.p
          className="text-neutral-200/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 backdrop-blur-sm bg-black/20 px-6 py-3 rounded-full"
          initial={{ opacity: 0, y: 20 }}
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
