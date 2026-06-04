"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  id: string | number;
  content: React.ReactNode;
};

type CarouselProps = {
  slides: Slide[];
  height?: string;
  slideWidth?: string;
  gap?: string;
  autoplayDelay?: number;
  loop?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  arrowClassName?: string;
  dotClassName?: string;
  className?: string;
};

export default function Carousel({
  slides,
  height = "35rem",
  slideWidth = "100%",
  gap = "0rem",
  autoplayDelay = 6000,
  loop = true,
  showArrows = true,
  showDots = true,
  arrowClassName = "",
  dotClassName = "",
  className = "",
}: CarouselProps) {
  // FIX: usamos useRef para que el plugin no se re-cree en cada render.
  // Sin esto, Embla puede re-inicializar el carrusel y producir parpadeos.
  const refAutoplay = useRef(
    Autoplay({ delay: autoplayDelay, stopOnInteraction: false })
  );

  /*
   * align: "start" es el correcto para slides de ancho completo (100%).
   * Con "center", Embla intenta centrar cada slide dentro del viewport
   * lo que puede generar saltos raros al hacer el wrap del loop.
   * Con "start" cada slide ocupa exactamente el viewport → wrap limpio.
   */
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop, align: "start", slidesToScroll: 3 },
    autoplayDelay > 0 ? [refAutoplay.current] : []
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(!loop);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(!loop);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (indice: number) => emblaApi?.scrollTo(indice),
    [emblaApi]
  );

  const alSeleccionar = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    if (!loop) {
      setPrevBtnDisabled(!emblaApi.canScrollPrev());
      setNextBtnDisabled(!emblaApi.canScrollNext());
    }
  }, [emblaApi, loop]);

  useEffect(() => {
    if (!emblaApi) return;
    alSeleccionar();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", alSeleccionar);
    emblaApi.on("reInit", alSeleccionar);
    return () => {
      emblaApi.off("select", alSeleccionar);
      emblaApi.off("reInit", alSeleccionar);
    };
  }, [emblaApi, alSeleccionar]);

  if (!slides || slides.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ height }}
      >
        <p className="text-gray-400">Sin slides</p>
      </div>
    );
  }

  return (
    /*
     * FIX PRINCIPAL: la altura se define aquí, en el wrapper exterior.
     * Antes estaba solo en el viewport interior, donde `height: 100%`
     * se calculaba contra este div sin altura → colapsaba a 0px.
     * Ahora el viewport y los slides usan `h-full` para heredar
     * correctamente desde este wrapper con dimensión concreta.
     */
    <div className={`relative w-full ${className}`} style={{ height }}>
      {/* El viewport de Embla ocupa el 100% del wrapper */}
      <div className="overflow-hidden h-full" ref={emblaRef}>
        {/* El contenedor flex también necesita h-full para que los slides hereden */}
        <div className="flex h-full" style={{ marginLeft: `-${gap}` }}>
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="min-w-0 h-full"
              style={{
                flex: `${slideWidth}`,
                paddingLeft: gap,
                // height ya no va aquí: lo hereda del flex container vía h-full
              }}
            >
              {/* Wrapper interno del slide */}
              <div className="h-full w-full bg-gray-800">
                {slide.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showArrows && (
        <>
          <button
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed ${arrowClassName}`}
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed ${arrowClassName}`}
            aria-label="Slide siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {showDots && scrollSnaps.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {scrollSnaps.map((_, indice) => (
            <button
              key={indice}
              onClick={() => scrollTo(indice)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${indice === selectedIndex
                  ? "bg-gray-800 w-8"
                  : "bg-gray-400 hover:bg-gray-600"
                } ${dotClassName}`}
              aria-label={`Ir a slide ${indice + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}