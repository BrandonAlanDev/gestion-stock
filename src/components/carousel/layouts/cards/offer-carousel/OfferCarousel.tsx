"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import OfferCard from "./OfferCard";
import CarouselNavigation from "./CarouselNavigation";
import type { OfferCarouselProps } from "./types";

export default function OfferCarousel({
  title,
  subtitle,
  items,
  primaryColor = "#06b6d4",
  autoplay = true,
  autoplayDelay = 5000,
  hideHeader = false,
  hideButtons = false,
}: OfferCarouselProps & { hideHeader?: boolean; hideButtons?: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      containScroll: "trimSnaps",
      dragFree: true,
    },
    autoplay ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })] : []
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  if (items.length === 0) return null;

  const carouselContent = (
    <div className="w-full px-4 md:px-12 lg:px-16">
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-14">
          <div>
            {subtitle && (
              <span className="text-[10px] font-black tracking-[0.4em] uppercase block mb-2" style={{ color: primaryColor }}>
                {subtitle}
              </span>
            )}
            <h2 className="text-3xl md:text-5xl font-black text-[var(--texto-sobre-secundario)] tracking-tight">
              {title || "Ofertas"}
            </h2>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="overflow-hidden -mx-2 md:-mx-3" ref={emblaRef}>
          <div className="flex">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-2 md:px-3"
              >
                <div className="aspect-[3/4] md:aspect-[4/5]">
                  <OfferCard
                    image={item.image}
                    title={item.title}
                    subtitle={item.subtitle}
                    discount={item.discount}
                    buttonText={item.buttonText}
                    href={item.href}
                    hideButton={item.hideButton}
                    hideButtons={hideButtons}
                    primaryColor={primaryColor}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <CarouselNavigation onPrev={scrollPrev} onNext={scrollNext} primaryColor={primaryColor} />
      </div>

      {scrollSnaps.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              className="rounded-full transition-all cursor-pointer"
              style={{
                width: selectedIndex === index ? "24px" : "8px",
                height: "8px",
                backgroundColor: selectedIndex === index ? primaryColor : "var(--texto-sobre-secundario)",
                opacity: selectedIndex === index ? 1 : 0.4,
              }}
              aria-label={"Ir al slide " + (index + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (hideHeader) return carouselContent;

  return (
    <section className="w-full bg-[var(--color-secundario)] py-16 md:py-20 lg:py-24">
      {carouselContent}
    </section>
  );
}
