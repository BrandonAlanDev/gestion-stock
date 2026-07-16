"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  id: string | number;
  image: string;
  title?: string;
  subtitle?: string;
  url?: string;
  ctaText?: string;
  config?: { hideText?: boolean };
};

interface ShowcaseLayoutProps {
  carousel: {
    id: string;
    settings: {
      height?: number;
      gap?: number;
      autoplayDelay?: number;
      showDots?: boolean;
      showArrows?: boolean;
      slidesToScroll?: number;
    };
    slides: Slide[];
  };
  primaryColor?: string;
}

export default function ShowcaseLayout({ carousel, primaryColor = "#06b6d4" }: ShowcaseLayoutProps) {
  const { settings, slides } = carousel;
  const height = settings.height || 500;
  const gap = settings.gap ?? 16;
  const autoplayDelay = settings.autoplayDelay ?? 5000;
  const showDots = settings.showDots ?? true;
  const showArrows = settings.showArrows ?? true;
  const slidesToScroll = settings.slidesToScroll ?? 1;
  const visibleSlides = 3;

  const refAutoplay = useRef(Autoplay({ delay: autoplayDelay, stopOnInteraction: false }));

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll },
    autoplayDelay > 0 ? [refAutoplay.current] : []
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-8" style={{ height: `${height}px` }}>
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full" style={{ marginLeft: `-${gap}px` }}>
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="min-w-0 h-full"
              style={{ flex: `0 0 calc(100% / ${visibleSlides})`, paddingLeft: `${gap}px` }}
            >
              <div
                className="h-full w-full rounded-2xl overflow-hidden relative group cursor-pointer"
                style={{ backgroundColor: primaryColor + "10" }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                {!slide.config?.hideText && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                )}
                {!slide.config?.hideText && (
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {slide.subtitle && (
                      <p className="text-xs font-black tracking-[0.3em] uppercase mb-1" style={{ color: primaryColor }}>
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.title && (
                      <h3 className="text-white font-black text-xl md:text-2xl tracking-tighter uppercase leading-tight">
                        {slide.title}
                      </h3>
                    )}
                    {slide.ctaText && (
                      <span
                        className="inline-block mt-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
                        style={{ backgroundColor: primaryColor, color: "#000" }}
                      >
                        {slide.ctaText}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showArrows && slides.length > visibleSlides && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md border"
            style={{
              backgroundColor: `${primaryColor}20`,
              borderColor: `${primaryColor}40`,
              color: primaryColor,
            }}
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md border"
            style={{
              backgroundColor: `${primaryColor}20`,
              borderColor: `${primaryColor}40`,
              color: primaryColor,
            }}
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {showDots && scrollSnaps.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className="h-2.5 rounded-full transition-all duration-300"
              style={{
                width: index === selectedIndex ? "2rem" : "0.5rem",
                backgroundColor: index === selectedIndex ? primaryColor : `${primaryColor}40`,
              }}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
