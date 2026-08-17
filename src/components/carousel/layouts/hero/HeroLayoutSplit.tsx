"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Store } from "lucide-react";
import { CarouselSlide } from "../types";
import { resolverEnlaceSlide } from "@/helpers/enlaceSlide";
import HeroCtaButton from "./HeroCtaButton";

export default function HeroLayoutSplit({
  slide,
}: {
  slide: CarouselSlide;
}) {
  return (
    <motion.div
      key={`split-${slide.id}`}
      className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        className="relative h-[60vh] min-h-[400px] rounded-2xl overflow-hidden"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Image
          src={slide.image}
          alt={slide.title || ""}
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </motion.div>

      <motion.div
        className="text-center lg:text-left px-4"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {slide.subtitle && (
          <motion.p className="text-xs font-black tracking-[0.35em] uppercase mb-4" style={{ color: "var(--color-primario)" }}>
            <Store className="inline-block w-4 h-4 mr-2 align-middle" /> {slide.subtitle}
          </motion.p>
        )}

        <motion.h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase italic leading-none mb-6">
          {slide.title}
        </motion.h1>

        {slide.description && (
          <motion.p className="text-neutral-200 text-lg md:text-xl max-w-xl mb-10">
            {slide.description}
          </motion.p>
        )}

        <HeroCtaButton url={resolverEnlaceSlide(slide) ?? undefined} ctaText={slide.ctaText} hideButton={slide.config?.hideButton} />
      </motion.div>
    </motion.div>
  );
}
