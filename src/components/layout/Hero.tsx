"use client";

import React, {
  useState,
  useEffect,
  useMemo,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Trophy,
} from "lucide-react";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { heroSlides } from "@/components/data/data";

const Hero = ({
  setActiveCategory,
}: any) => {
  const [current, setCurrent] = useState(0);
  const { pageConfig } = usePageConfig();

  // =====================================
  // DYNAMIC SLIDES
  // =====================================

  const slides = useMemo(() => {
    const dynamicSlide = {
      id: "store-main",
      title:
        pageConfig?.storeName ||
        "MYA SPORTS",
      subtitle:
        pageConfig?.slogan ||
        "⚡ CULTURA DEPORTIVA Y URBANA",
      description:
        pageConfig?.description ||
        "Especialistas en botines de alta gama y calzado streetwear seleccionado para jugadores exigentes.",
      image:
        pageConfig?.banner ||
        "https://images.unsplash.com/photo-1579952365116-7a5ed211daef?q=80&w=2000&auto=format&fit=crop",
      ctaText:
        "EXPLORAR DROP",
      targetCategory: null,
    };

    return [
      dynamicSlide,
      ...heroSlides,
    ];
  }, [pageConfig]);

  // =====================================
  // AUTOPLAY
  // =====================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrent(
        (prev) =>
          (prev + 1) %
          slides.length
      );
    }, 6000);

    return () => clearTimeout(timer);
  }, [current, slides.length]);

  // =====================================
  // NAVIGATION
  // =====================================

  const handleNext = () => {
    setCurrent(
      (prev) =>
        (prev + 1) %
        slides.length
    );
  };

  const handlePrev = () => {
    setCurrent(
      (prev) =>
        (prev - 1 +
          slides.length) %
        slides.length
    );
  };

  const handleDotClick = (
    index: number
  ) => {
    setCurrent(index);
  };

  const handleHeroCta = (
    category: any
  ) => {
    if (category) {
      setActiveCategory(
        category
      );
    }

    const section =
      document.getElementById(
        "featured"
      ) ||
      document.getElementById(
        "products"
      );

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const currentSlide = slides[current];

  // =====================================
  // COLORS
  // =====================================

  const primaryColor =
    pageConfig?.primaryColor ||
    "#00f0ff"; // Por defecto Cyan Eléctrico si no viene configurado

  return (
    <div
      className="
        relative
        isolate
        w-full
        h-[100dvh]
        overflow-hidden
        bg-black
        text-white
      "
    >
      {/* ===================================== */}
      {/* BACKGROUND WITH HARD BG GRADIENT */}
      {/* ===================================== */}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
          className="absolute inset-0"
          style={{
            willChange: "opacity",
          }}
        >
          {/* IMAGE WRAPPER WITH ACCENTUATED SCALE DOWN EFFECT */}
          <motion.div
            initial={{
              scale: 1.1,
            }}
            animate={{
              scale: 1,
            }}
            transition={{
              duration: 6,
              ease: "easeOut",
            }}
            className="
              absolute inset-0
              will-change-transform
              transform-gpu
            "
            style={{
              willChange: "transform",
            }}
          >
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="
                w-full
                h-full
                object-cover
                opacity-70
                pointer-events-none
                select-none
                filter grayscale-[30%] brightness-[85%]
              "
              draggable={false}
            />
          </motion.div>

          {/* OVERLAYS - EDITORIAL CONTRAST */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.2) 100%)",
            }}
          />

          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 60%, rgba(0,0,0,0.4) 100%)",
            }}
          />

          {/* BACKGROUND SPORT TEXTURE (SUBTLE SCANLINES EFFECT) */}
          <div className="absolute inset-0 z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.03),_rgba(0,255,255,0.03),_rgba(0,0,255,0.03))] bg-[size:100%_4px,_6px_100%] opacity-40 pointer-events-none" />

          {/* AMBIENT GLOW */}
          <div
            className="absolute inset-0 z-10 opacity-15"
            style={{
              background: `radial-gradient(circle at 10% 50%, ${primaryColor} 0%, transparent 65%)`,
              willChange: "opacity",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ===================================== */}
      {/* CONTENT (RUDGED AND ASYMMETRIC) */}
      {/* ===================================== */}

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: 10,
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut"
            }}
            className="max-w-4xl"
            style={{
              willChange: "transform, opacity",
            }}
          >
            {/* TECHNICAL BADGE */}
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="mb-5"
            >
              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-1.5
                  border-l-2
                  bg-white/5
                  backdrop-blur-xs
                  text-[11px]
                  uppercase
                  tracking-[0.3em]
                  font-black
                "
                style={{
                  borderLeftColor: primaryColor,
                  color: primaryColor,
                }}
              >
                <Trophy size={12} className="stroke-[2.5]" />
                {currentSlide.subtitle}
              </span>
            </motion.div>

            {/* TITLE - EXTRA BOLD / ITALIC STRIKE */}
            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.15,
              }}
              className="
                text-5xl
                sm:text-7xl
                md:text-8xl
                lg:text-9xl
                font-black
                uppercase
                italic
                tracking-tighter
                leading-[0.85]
                text-white
                drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]
              "
            >
              {currentSlide.title}
            </motion.h1>

            {/* DESCRIPTION - TECHNICAL CAPS */}
            <motion.p
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="
                mt-6
                text-xs
                sm:text-sm
                md:text-base
                text-neutral-300
                uppercase
                tracking-wider
                leading-relaxed
                max-w-xl
                font-semibold
                border-t border-white/10 pt-4
              "
            >
              {currentSlide.description}
            </motion.p>

            {/* CTA - INDUSTRIAL HARD BOX BUTTON */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: 0.25,
              }}
              className="flex flex-wrap gap-4 mt-8"
            >
              <button
                onClick={() =>
                  handleHeroCta(currentSlide.targetCategory)
                }
                className="
                  group
                  relative
                  overflow-hidden
                  px-8
                  py-4
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-xs
                  flex items-center
                  gap-4
                  transition-all
                  duration-300
                  active:scale-[0.97]
                "
                style={{
                  background: primaryColor,
                  color: "#000",
                }}
              >
                {/* Clean Hover Overlay */}
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                
                <span className="relative z-10">
                  {currentSlide.ctaText || "COMPRAR COLOQUE"}
                </span>
                
                <ArrowRight className="relative z-10 w-4 h-4 stroke-[3] group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ===================================== */}
      {/* NAVIGATION - FLAT SQUARE CONTROLS */}
      {/* ===================================== */}

      <div className="absolute bottom-6 right-4 sm:right-8 z-30 flex gap-1">
        <button
          onClick={handlePrev}
          className="
            group
            w-12
            h-12
            bg-neutral-900/80
            hover:bg-black
            border border-neutral-800
            flex
            items-center
            justify-center
            text-white/60
            hover:text-white
            transition-colors
            duration-200
            active:scale-95
          "
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={handleNext}
          className="
            group
            w-12
            h-12
            bg-neutral-900/80
            hover:bg-black
            border border-neutral-800
            flex
            items-center
            justify-center
            text-white/60
            hover:text-white
            transition-colors
            duration-200
            active:scale-95
          "
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ===================================== */}
      {/* INDICATORS - BOTTOM LINE PROGRESS */}
      {/* ===================================== */}

      <div className="absolute bottom-6 left-4 sm:left-8 z-30 flex items-center gap-2">
        {slides.map((slide, index) => {
          const active = index === current;

          return (
            <button
              key={slide.id}
              onClick={() => handleDotClick(index)}
              className={`
                relative
                h-1
                transition-all
                duration-300
                ${
                  active
                    ? "w-12"
                    : "w-4 opacity-40 hover:opacity-75"
                }
              `}
              style={{
                background: active ? primaryColor : "#ffffff",
              }}
            >
              {active && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 6, ease: "linear" }}
                  className="absolute inset-0 origin-left"
                  style={{
                    background: primaryColor,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Hero;