"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HeroLayout from "./layouts/hero/HeroLayout";
import BannerLayout from "./layouts/banner/BannerLayout";
import CardsLayout from "./layouts/cards/CardsLayout";
import ShowcaseLayout from "./layouts/hero/ShowcaseLayout";

interface CarouselSlide {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  url?: string;
  config?: { hideText?: boolean };
}

interface Carousel {
  id: string;
  type: "HERO" | "BANNER" | "CARDS";
  title?: string;
  active: boolean;
  order: number;
  settings?: {
    heroStyle?: "DEFAULT" | "SHOWCASE";
    slideLayout?: string;
    height?: number;
    [key: string]: unknown;
  };
  slides: CarouselSlide[];
}

export default function AllCarousels({ storeName }: { storeName?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["carousels", "all"],
    queryFn: async () => {
      const res = await fetch("/api/carousels");
      if (!res.ok) throw new Error("Error al cargar carruseles");
      const json = await res.json();
      return (json.data || []) as Carousel[];
    },
    staleTime: 60_000,
    enabled: mounted,
  });

  if (!mounted) {
    return <SkeletonAll />;
  }

  if (isLoading) {
    return <SkeletonAll />;
  }

  if (error) {
    return null;
  }

  const carousels = (data || [])
    .filter((c) => c.active)
    .sort((a, b) => a.order - b.order);

  if (carousels.length === 0) {
    return null;
  }

  const firstIsHero = carousels[0]?.type === "HERO";

  return (
    <div className={"carousel-container space-y-0" + (firstIsHero ? "" : " mt-16")}>
      {carousels.map((carousel) => {
        const isShowcase = carousel.settings?.heroStyle === "SHOWCASE";
        switch (carousel.type) {
          case "HERO":
            if (isShowcase) {
              return <ShowcaseLayout key={carousel.id} carousel={carousel} />;
            }
            return <HeroLayout key={carousel.id} carousel={carousel} />;
          case "BANNER":
            if (isShowcase) {
              return <ShowcaseLayout key={carousel.id} carousel={carousel} />;
            }
            return <BannerLayout key={carousel.id} carousel={carousel} />;
          case "CARDS":
            if (isShowcase) {
              return <ShowcaseLayout key={carousel.id} carousel={carousel} />;
            }
            return <CardsLayout key={carousel.id} carousel={carousel} storeName={storeName} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

function SkeletonAll() {
  return (
    <div className="carousel-container space-y-0">
      <div className="w-full h-[100dvh] bg-neutral-900 animate-pulse" />
      <div className="w-full h-[300px] bg-neutral-800 animate-pulse" />
      <div className="w-full py-16 px-4 md:px-12 lg:px-16 bg-white">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="h-[50vh] bg-neutral-200 animate-pulse" />
          <div className="h-[50vh] bg-neutral-300 animate-pulse" />
        </div>
      </div>
    </div>
  );
}