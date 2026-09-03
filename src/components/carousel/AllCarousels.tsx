"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HeroLayout from "./layouts/hero/HeroLayout";
import BannerLayout from "./layouts/banner/BannerLayout";
import CardsLayout from "./layouts/cards/CardsLayout";
import ShowcaseLayout from "./layouts/hero/ShowcaseLayout";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";
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

export default function AllCarousels({ storeName }: { storeName?: string }) {
  const tenantId = useTenantId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tenant", tenantId, "carousels", "all"],
    queryFn: async () => {
      const res = await fetch("/api/carousels");
      if (!res.ok) throw new Error("Error al cargar carruseles");
      const json = await res.json();
      return (json.data || []) as Carousel[];
    },
    staleTime: 60_000,
    gcTime: 10 * 60_000,
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
    <div className="carousel-container space-y-0">
      <div className="w-full h-[100dvh] bg-[var(--color-fondo-sitio)] animate-pulse" />
      <div className="w-full h-[300px] bg-[var(--superficie-fondo)] animate-pulse" />
      <div className="w-full py-16 px-4 md:px-12 lg:px-16 bg-[var(--color-fondo-sitio)]">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="h-[50vh] bg-[var(--superficie-fondo)] animate-pulse" />
          <div className="h-[50vh] bg-[var(--color-secundario)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
