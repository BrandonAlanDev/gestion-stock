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
  Store,
} from "lucide-react";

import { usePageConfig } from "@/components/providers/PageConfigProvider";

import { heroSlides } from "./data";

const Hero = ({
  setActiveCategory,
}: any) => {
  const [current, setCurrent] =
    useState(0);

  const { pageConfig } =
    usePageConfig();

  // =====================================
  // DYNAMIC SLIDES
  // =====================================

  const slides = useMemo(() => {
    const dynamicSlide = {
      id: "store-main",

      title:
        pageConfig?.storeName ||
        "GestionOK",

      subtitle:
        pageConfig?.slogan ||
        "Tu tienda online",

      description:
        pageConfig?.description ||
        "Descubrí productos únicos con una experiencia moderna y premium.",

      image:
        pageConfig?.banner ||
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2000&auto=format&fit=crop",

      ctaText:
        "Explorar catálogo",

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

    return () =>
      clearTimeout(timer);
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

  const currentSlide =
    slides[current];

  // =====================================
  // COLORS
  // =====================================

  const primaryColor =
    pageConfig?.primaryColor ||
    "#06b6d4";

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
      {/* BACKGROUND */}
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
            duration: 0.7,
          }}
          className="absolute inset-0"
          style={{
            willChange:
              "opacity",
          }}
        >
          {/* IMAGE WRAPPER */}

          <motion.div
            initial={{
              scale: 1.06,
            }}
            animate={{
              scale: 1,
            }}
            transition={{
              duration: 8,
              ease: "linear",
            }}
            className="
              absolute inset-0
              will-change-transform
              transform-gpu
            "
            style={{
              willChange:
                "transform",
            }}
          >
            <img
              src={
                currentSlide.image
              }
              alt={
                currentSlide.title
              }
              className="
                w-full
                h-full
                object-cover
                opacity-80
                pointer-events-none
                select-none
              "
              draggable={false}
            />
          </motion.div>

          {/* OVERLAYS */}

          <div
            className="
              absolute inset-0 z-10
            "
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.92), rgba(0,0,0,0.6), rgba(0,0,0,0.15))",
            }}
          />

          <div
            className="
              absolute inset-0 z-10
            "
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9), transparent, rgba(0,0,0,0.35))",
            }}
          />

          {/* AMBIENT LIGHT */}

          <div
            className="
              absolute inset-0 z-10 opacity-20
            "
            style={{
              background: `radial-gradient(circle at center, ${primaryColor} 0%, transparent 70%)`,
              willChange:
                "opacity",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ===================================== */}
      {/* CONTENT */}
      {/* ===================================== */}

      <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            transition={{
              duration: 0.45,
            }}
            className="max-w-3xl"
            style={{
              willChange:
                "transform, opacity",
            }}
          >
            {/* BADGE */}

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
              className="mb-6"
            >
              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-5
                  py-2
                  rounded-full
                  border
                  backdrop-blur-md
                  text-xs
                  uppercase
                  tracking-[0.35em]
                  font-black
                "
                style={{
                  borderColor: `${primaryColor}40`,
                  color:
                    primaryColor,
                  background:
                    `${primaryColor}10`,
                }}
              >
                <Store size={14} />

                {
                  currentSlide.subtitle
                }
              </span>
            </motion.div>

            {/* TITLE */}

            <motion.h1
              initial={{
                opacity: 0,
                y: 15,
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
                md:text-7xl
                lg:text-8xl
                font-black
                uppercase
                italic
                tracking-tighter
                leading-[0.9]
                text-white
              "
            >
              {
                currentSlide.title
              }
            </motion.h1>

            {/* DESCRIPTION */}

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
                mt-8
                text-lg
                md:text-xl
                text-neutral-300
                leading-relaxed
                max-w-2xl
                font-light
              "
            >
              {
                currentSlide.description
              }
            </motion.p>

            {/* CTA */}

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.25,
              }}
              className="flex flex-wrap gap-4 mt-10"
            >
              <button
                onClick={() =>
                  handleHeroCta(
                    currentSlide.targetCategory
                  )
                }
                className="
                  group
                  relative
                  overflow-hidden
                  px-8
                  py-5
                  rounded-2xl
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-sm
                  flex items-center
                  gap-3
                  transition-all
                  duration-300
                  hover:scale-[1.03]
                  active:scale-[0.98]
                "
                style={{
                  background:
                    primaryColor,
                  color: "#000",
                  boxShadow: `0 0 40px ${primaryColor}35`,
                  willChange:
                    "transform",
                }}
              >
                {/* Hover Overlay */}

                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <span className="relative z-10">
                  {
                    currentSlide.ctaText
                  }
                </span>

                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ===================================== */}
      {/* NAVIGATION */}
      {/* ===================================== */}

      <div className="absolute bottom-8 right-8 z-30 flex gap-3">
        <button
          onClick={handlePrev}
          className="
            group
            relative
            overflow-hidden
            w-14
            h-14
            rounded-2xl
            border
            border-white/10
            bg-black/30
            backdrop-blur-md
            flex
            items-center
            justify-center
            text-white
            transition-all
            duration-300
            hover:scale-105
            active:scale-90
          "
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `${primaryColor}20`,
            }}
          />

          <ChevronLeft className="relative z-10 w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-300" />
        </button>

        <button
          onClick={handleNext}
          className="
            group
            relative
            overflow-hidden
            w-14
            h-14
            rounded-2xl
            border
            border-white/10
            bg-black/30
            backdrop-blur-md
            flex
            items-center
            justify-center
            text-white
            transition-all
            duration-300
            hover:scale-105
            active:scale-90
          "
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `${primaryColor}20`,
            }}
          />

          <ChevronRight className="relative z-10 w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" />
        </button>
      </div>

      {/* ===================================== */}
      {/* INDICATORS */}
      {/* ===================================== */}

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {slides.map(
          (slide, index) => {
            const active =
              index === current;

            return (
              <button
                key={slide.id}
                onClick={() =>
                  handleDotClick(
                    index
                  )
                }
                className={`
                  relative
                  overflow-hidden
                  rounded-full
                  transition-all
                  duration-300

                  ${
                    active
                      ? "w-14 h-2.5"
                      : "w-2.5 h-2.5 hover:w-6"
                  }
                `}
                style={{
                  background:
                    active
                      ? primaryColor
                      : "#ffffff40",

                  boxShadow:
                    active
                      ? `0 0 20px ${primaryColor}80`
                      : "none",

                  willChange:
                    "transform",
                }}
              >
                {active && (
                  <motion.div
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
                      duration: 0.2,
                    }}
                    className="absolute inset-0"
                    style={{
                      background:
                        primaryColor,
                    }}
                  />
                )}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
};

export default Hero;