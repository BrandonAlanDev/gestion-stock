"use client";

import { useEffect, useState } from "react";
import { useCarousels } from "@/hooks/useCarousels";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import HeroLayout from "./layouts/hero/HeroLayout";
import BannerLayout from "./layouts/banner/BannerLayout";
import CardsLayout from "./layouts/cards/CardsLayout";
import ShowcaseLayout from "./layouts/hero/ShowcaseLayout";

interface CarouselContainerProps {
  filterType?: "HERO" | "BANNER" | "CARDS";
  excludeFirst?: boolean;
  storeName?: string;
}

export default function CarouselContainer({ filterType = "BANNER", excludeFirst = false, storeName }: CarouselContainerProps) {
  const { data, isLoading, error } = useCarousels({ type: filterType });
  const { pageConfig } = usePageConfig();
  const [mounted, setMounted] = useState(false);

  const primaryColor = (typeof pageConfig?.primaryColor === "string" && pageConfig.primaryColor) ? pageConfig.primaryColor : "#06b6d4";

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
        const isShowcase = carousel.settings?.heroStyle === "SHOWCASE";
        switch (carousel.type) {
          case "HERO":
            if (isShowcase) {
              return <ShowcaseLayout key={carousel.id} carousel={carousel} primaryColor={primaryColor} />;
            }
            return <HeroLayout key={carousel.id} carousel={carousel} primaryColor={primaryColor} />;
          case "BANNER":
            if (isShowcase) {
              return <ShowcaseLayout key={carousel.id} carousel={carousel} primaryColor={primaryColor} />;
            }
            return <BannerLayout key={carousel.id} carousel={carousel} primaryColor={primaryColor} />;
          case "CARDS":
            if (isShowcase) {
              return <ShowcaseLayout key={carousel.id} carousel={carousel} primaryColor={primaryColor} />;
            }
            return <CardsLayout key={carousel.id} carousel={carousel} storeName={storeName} primaryColor={primaryColor} />;
          default:
            return null;
        }
      })}
    </div>
  );
}