"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroNavButtons({
  handlePrev,
  handleNext,
}: {
  handlePrev: () => void;
  handleNext: () => void;
}) {
  return (
    <div className="absolute bottom-8 right-8 z-30 flex gap-1 md:gap-3">
      <motion.button
        onClick={handlePrev}
        className="group relative overflow-hidden w-14 h-14 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-90"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Slide anterior"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "color-mix(in srgb, var(--color-primario) 12%, transparent)" }} />
        <ChevronLeft className="relative z-10 w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-300" />
      </motion.button>
      <motion.button
        onClick={handleNext}
        className="group relative overflow-hidden w-14 h-14 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-90"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Slide siguiente"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "color-mix(in srgb, var(--color-primario) 12%, transparent)" }} />
        <ChevronRight className="relative z-10 w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" />
      </motion.button>
    </div>
  );
}
