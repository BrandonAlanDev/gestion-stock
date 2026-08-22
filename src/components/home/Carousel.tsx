// src/components/home/Carousel.tsx
"use client";

import { CarouselType } from "../../../generated/prisma"
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import HeroSimple from "./carousel-templates/HeroSimple";

type Slide = {
  id: number;
  image: string;
  title?: string | null;
  subtitle?: string | null;
  text?: string | null;
  url?: string | null;
};

interface CarouselProps {
  slides: Slide[];
  carouselType: CarouselType;
  autoplay: boolean;
  interval: number;
}

export default function Carousel({ slides, carouselType, autoplay, interval }: CarouselProps) {
  const plugins = autoplay ? [Autoplay({ delay: interval })] : [];
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, plugins);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  if (!slides.length) return null;

  const renderSlide = (slide: Slide) => {
    const commonProps = { image: slide.image };
    switch (carouselType) {
      case "HERO_SIMPLE":
        return <HeroSimple {...commonProps} alt={slide.title || ""} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0">
              {renderSlide(slide)}
            </div>
          ))}
        </div>
      </div>
      {/* Indicadores */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${index === selectedIndex ? "bg-cyan-500" : "bg-white/50"
              }`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}