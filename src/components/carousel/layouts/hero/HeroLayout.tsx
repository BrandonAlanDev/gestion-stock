"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroLayoutProps } from "../types";
import HeroLayoutStandard from "./HeroLayoutStandard";
import HeroLayoutSplit from "./HeroLayoutSplit";
import HeroLayoutMinimal from "./HeroLayoutMinimal";
import HeroNavButtons from "./HeroNavButtons";
import HeroDots from "./HeroDots";

export default function HeroLayout({ carousel }: HeroLayoutProps) {
  const { settings, slides } = carousel;
  const [current, setCurrent] = useState(0);

  const transitionDuration = settings.transitionDuration || 6000;
  const autoPlay = settings.autoPlay ?? true;
  const showDots = settings.showDots ?? true;
  const showNavButtons = settings.showNavButtons ?? true;
  const overlayOpacity = settings.overlayOpacity ?? 0.9;

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
  const layout = settings.slideLayout || "standard";

  return (
    <section className="relative h-[78dvh] min-h-[520px] max-h-[820px] w-full bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.image})` }}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </AnimatePresence>

      {!slide.config?.hideText && (
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: overlayOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="absolute inset-0 bg-black/60" />
          </motion.div>
        </AnimatePresence>
      )}

      <div className="relative h-full flex items-center justify-center px-4 md:px-12 lg:px-16">
        {!slide.config?.hideText && (
          <AnimatePresence mode="wait">
            {layout === "standard" && <HeroLayoutStandard slide={slide} />}
            {layout === "split" && <HeroLayoutSplit slide={slide} />}
            {layout === "minimal" && <HeroLayoutMinimal slide={slide} />}
          </AnimatePresence>
        )}

        {showNavButtons && slides.length > 1 && (
          <HeroNavButtons handlePrev={handlePrev} handleNext={handleNext} />
        )}

        {showDots && slides.length > 1 && (
          <HeroDots slidesCount={slides.length} current={current} onChange={setCurrent} />
        )}
      </div>
    </section>
  );
}
