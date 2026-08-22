"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolverEnlaceSlide } from "@/helpers/enlaceSlide";

interface CarouselSlide {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  url?: string;
  config?: { hideText?: boolean; linkType?: string };
}

interface BannerLayoutProps {
  carousel: {
    id: string;
    settings: {
      height?: number;
      transitionDuration?: number;
      autoPlay?: boolean;
      showDots?: boolean;
      showNavButtons?: boolean;
    };
    slides: CarouselSlide[];
  };
  primaryColor?: string;
}

export default function BannerLayout({ carousel, primaryColor = "#06b6d4" }: BannerLayoutProps) {
  const { settings, slides } = carousel;
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const height = settings.height || 300;
  const transitionDuration = settings.transitionDuration || 4000;
  const autoPlay = settings.autoPlay ?? true;
  const showDots = settings.showDots ?? true;
  const showNavButtons = settings.showNavButtons ?? false;

  const handleNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const timer = setInterval(handleNext, transitionDuration);
    return () => clearInterval(timer);
  }, [autoPlay, transitionDuration, slides.length, handleNext]);

  if (slides.length === 0) return null;

  const slide = slides[current];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: `${height}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.image})` }}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </AnimatePresence>

      {!slide.config?.hideText && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/70" />
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${primaryColor}22 0%, transparent 70%)` }} />
        </>
      )}

      <div className="relative h-full flex items-center justify-center">
        {!slide.config?.hideText && (
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              className="w-full max-w-6xl text-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {slide.subtitle && (
                <motion.p
                  className="text-xs font-black tracking-[0.35em] uppercase mb-2"
                  style={{ color: primaryColor }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {slide.subtitle}
                </motion.p>
              )}
              <motion.h2
                className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-tight mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {slide.title}
              </motion.h2>
              {slide.description && (
                <motion.p
                  className="text-neutral-200 text-base md:text-lg max-w-2xl mx-auto mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {slide.description}
                </motion.p>
              )}
              {(slide.url?.trim() || slide.ctaText) && (
                <motion.a
                  href={resolverEnlaceSlide(slide) || "#"}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white text-black font-black uppercase tracking-wider text-sm hover:bg-neutral-100 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {slide.ctaText || "Ver más"}
                </motion.a>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {(showNavButtons && slides.length > 1) && (
          <>
            <motion.button
              onClick={handlePrev}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full backdrop-blur-md border transition-all",
                isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              style={{ borderColor: `${primaryColor}40`, background: `rgba(0,0,0,0.3)` }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Slide anterior"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isHovered ? 1 : 0, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button
              onClick={handleNext}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full backdrop-blur-md border transition-all",
                isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              style={{ borderColor: `${primaryColor}40`, background: `rgba(0,0,0,0.3)` }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Slide siguiente"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </motion.button>
          </>
        )}

        {showDots && slides.length > 1 && (
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrent(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === current ? "w-10" : "w-2"
                )}
                style={{
                  backgroundColor: index === current ? primaryColor : "rgba(255,255,255,0.4)",
                  boxShadow: index === current ? `0 0 15px ${primaryColor}` : "none",
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
