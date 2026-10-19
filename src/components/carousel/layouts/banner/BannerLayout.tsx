"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolverEnlaceSlide } from "@/lib/enlaces/resolver-enlace-slide";

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
}

export default function BannerLayout({ carousel }: BannerLayoutProps) {
  const { settings, slides } = carousel;
  const [current, setCurrent] = useState(0);

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

  useEffect(() => {
    setCurrent((prev) => Math.min(prev, Math.max(slides.length - 1, 0)));
  }, [slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[current];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: `${height}px` }}
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
          <div className="absolute inset-0 bg-black/50" />
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
                  className="mb-2 text-sm font-medium"
                  style={{ color: "var(--color-primario)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {slide.subtitle}
                </motion.p>
              )}
              <motion.h2
                className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl"
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
              {resolverEnlaceSlide(slide) && (
                <motion.a
                  href={resolverEnlaceSlide(slide) ?? undefined}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--color-primario)] px-5 py-2.5 text-sm font-semibold text-[var(--texto-sobre-primario)] transition-opacity hover:opacity-90"
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
              className="absolute left-3 top-1/2 z-20 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-black/40 text-white sm:left-4"
              style={{ borderColor: "color-mix(in srgb, var(--color-primario) 25%, transparent)", background: "rgba(0,0,0,0.3)" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Slide anterior"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button
              onClick={handleNext}
              className="absolute right-3 top-1/2 z-20 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-black/40 text-white sm:right-4"
              style={{ borderColor: "color-mix(in srgb, var(--color-primario) 25%, transparent)", background: "rgba(0,0,0,0.3)" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Slide siguiente"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
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
                className="flex h-10 w-10 items-center justify-center"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Ir a slide ${index + 1}`}
              >
                <span className={`h-2 rounded-full transition-all duration-300 ${index === current ? "w-8" : "w-2"}`} style={{ backgroundColor: index === current ? "var(--color-primario)" : "rgba(255,255,255,0.6)" }} />
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
