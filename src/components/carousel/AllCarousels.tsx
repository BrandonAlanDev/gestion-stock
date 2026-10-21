"use client";

import { useQuery } from "@tanstack/react-query";
import HeroLayout from "./layouts/hero/HeroLayout";
import BannerLayout from "./layouts/banner/BannerLayout";
import CardsLayout from "./layouts/cards/CardsLayout";
import ShowcaseLayout from "./layouts/hero/ShowcaseLayout";
import type { CarouselSettings } from "@/types/carousel";

interface CarouselSlide {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  url?: string;
  config?: Record<string, unknown> & { hideText?: boolean };
}

interface Carousel {
  id: string;
  type: "HERO" | "BANNER" | "CARDS";
  title?: string;
  active: boolean;
  order: number;
  settings?: CarouselSettings;
  slides: CarouselSlide[];
}

export default function AllCarousels({ storeName, initialCarousels }: { storeName?: string; initialCarousels?: Carousel[] }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["carousels", "all"],
    queryFn: async () => {
      const res = await fetch("/api/carousels");
      if (!res.ok) throw new Error("Error al cargar carruseles");
      const json = await res.json();
      return (json.data || []) as Carousel[];
    },
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    initialData: initialCarousels,
  });

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

  return (
    <div className="carousel-container space-y-0">
      {carousels.map((carousel) => {
        const isShowcase = carousel.settings?.heroStyle === "SHOWCASE";
        const carruselNormalizado = {
          ...carousel,
          settings: carousel.settings ?? {},
        };
        switch (carousel.type) {
          case "HERO":
            if (isShowcase) {
              return <ShowcaseLayout key={carousel.id} carousel={carruselNormalizado} />;
            }
            return <HeroLayout key={carousel.id} carousel={carruselNormalizado} />;
          case "BANNER":
            if (isShowcase) {
              return <ShowcaseLayout key={carousel.id} carousel={carruselNormalizado} />;
            }
            return <BannerLayout key={carousel.id} carousel={carruselNormalizado} />;
          case "CARDS":
            if (isShowcase) {
              return <ShowcaseLayout key={carousel.id} carousel={carruselNormalizado} />;
            }
            return <CardsLayout key={carousel.id} carousel={carruselNormalizado} storeName={storeName} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

function SkeletonAll() {
  return (
    <div role="status" aria-label="Cargando carruseles" className="carousel-container">
      <div aria-hidden="true" className="relative h-[78dvh] min-h-[520px] max-h-[820px] w-full bg-[var(--superficie-imagen)] motion-safe:animate-pulse">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-4">
          <div className="h-5 w-40 rounded-md bg-[var(--color-fondo-sitio)]/20" />
          <div className="h-12 w-72 max-w-full rounded-md bg-[var(--color-fondo-sitio)]/20" />
          <div className="h-11 w-36 rounded-md bg-[var(--color-fondo-sitio)]/20" />
        </div>
      </div>
      <span className="sr-only">Cargando carruseles...</span>
    </div>
  );
}
