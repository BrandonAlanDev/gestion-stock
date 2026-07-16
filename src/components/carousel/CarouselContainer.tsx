"use client";

import { useEffect, useState } from "react";
import { useCarousels } from "@/hooks/useCarousels";
import HeroLayout from "./layouts/HeroLayout";
import BannerLayout from "./layouts/BannerLayout";
import CardsLayout from "./layouts/CardsLayout";
import ShowcaseLayout from "./layouts/ShowcaseLayout";

interface CarouselContainerProps {
  filterType?: "HERO" | "BANNER" | "CARDS";
  excludeFirst?: boolean;
}

export default function CarouselContainer({ filterType = "BANNER", excludeFirst = false }: CarouselContainerProps) {
  const { data, isLoading, error } = useCarousels({ type: filterType });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    switch (filterType) {
      case "HERO":
        return <div className="w-full h-[100dvh] bg-neutral-900 animate-pulse" />;
      case "BANNER":
        return <div className="w-full h-[300px] bg-neutral-800 animate-pulse" />;
      case "CARDS":
        return (
          <div className="w-full py-16 px-4 md:px-12 lg:px-16 bg-white">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="h-[50vh] bg-neutral-200 animate-pulse" />
              <div className="h-[50vh] bg-neutral-300 animate-pulse" />
            </div>
          </div>
        );
      default:
        return <div className="w-full h-[300px] bg-neutral-800 animate-pulse" />;
    }
  }

  if (error) {
    return null;
  }

  const carousels = data?.filter((c) => c.active) || [];

  if (carousels.length === 0) {
    return null;
  }

  const filteredCarousels = excludeFirst ? carousels.slice(1) : carousels;

  if (filteredCarousels.length === 0) return null;

  return (
    <div className="carousel-container space-y-0">
      {filteredCarousels.map((carousel) => {
        switch (carousel.type) {
          case "HERO":
            if (carousel.settings?.heroStyle === "SHOWCASE") {
              return <ShowcaseLayout key={carousel.id} carousel={carousel} />;
            }
            return <HeroLayout key={carousel.id} carousel={carousel} />;
          case "BANNER":
            return <BannerLayout key={carousel.id} carousel={carousel} />;
          case "CARDS":
            return <CardsLayout key={carousel.id} carousel={carousel} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
