"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import HeroLayout from "@/components/carousel/layouts/hero/HeroLayout";
import BannerLayout from "@/components/carousel/layouts/banner/BannerLayout";
import CardsLayout from "@/components/carousel/layouts/cards/CardsLayout";
import ShowcaseLayout from "@/components/carousel/layouts/hero/ShowcaseLayout";
import AllCarousels from "@/components/carousel/AllCarousels";
import ProductLayout from "@/components/providers/products/layouts/ProductLayout";
import LocationCard from "@/components/ui/LocationCard";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getSectionMt } from "@/lib/section-mt";

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

interface CarouselData {
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

interface HomeClientProps {
  pageConfig: {
    address?: string | null;
    city?: string | null;
    province?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    mapsUrl?: string | null;
    locationEnabled?: boolean;
    primaryColor?: string;
    secondaryColor?: string;
    sectionOrder?: string;
    [key: string]: unknown;
  } | null;
}

function parseSectionOrder(raw: unknown): string[] {
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { }
  }
  return [];
}

function renderCarousel(carousel: CarouselData, storeName?: string) {
  const isShowcase = carousel.settings?.heroStyle === "SHOWCASE";
  switch (carousel.type) {
    case "HERO":
      return isShowcase
        ? <ShowcaseLayout key={carousel.id} carousel={carousel} />
        : <HeroLayout key={carousel.id} carousel={carousel} />;
    case "BANNER":
      return isShowcase
        ? <ShowcaseLayout key={carousel.id} carousel={carousel} />
        : <BannerLayout key={carousel.id} carousel={carousel} />;
    case "CARDS":
      return isShowcase
        ? <ShowcaseLayout key={carousel.id} carousel={carousel} />
        : <CardsLayout key={carousel.id} carousel={carousel} storeName={storeName} />;
    default:
      return null;
  }
}

export default function HomeClient({ pageConfig }: HomeClientProps) {
  const { pageConfig: contextConfig } = usePageConfig();
  const config = (pageConfig || contextConfig) as Record<string, unknown>;

  const primaryColor = (config?.primaryColor as string) || "#06b6d4";
  const secondaryColor = (config?.secondaryColor as string) || "#f8fafc";
  const showLocation = config?.locationEnabled && config?.address;

  const sectionOrder = parseSectionOrder(config?.sectionOrder);
  const hasCustomOrder = sectionOrder.length > 0;

  const carousels = (config?.carousels as any[]) || [];
  const heroSettings = carousels.find(c => c.type === "HERO")?.settings as Record<string, unknown> | undefined;
  const cardsSettings = carousels.find(c => c.type === "CARDS")?.settings as Record<string, unknown> | undefined;
  const featuredLayout = config?.featuredLayout as string | undefined;

  const isNewFormat = hasCustomOrder && sectionOrder.some((s) => s.startsWith("carousel_"));

  const { data: fetchedCarousels } = useQuery({
    queryKey: ["carousels", "home-order"],
    queryFn: async () => {
      const res = await fetch("/api/carousels");
      if (!res.ok) throw new Error("Error al cargar carruseles");
      const json = await res.json();
      return (json.data || []) as CarouselData[];
    },
    staleTime: 60_000,
    enabled: isNewFormat,
  });

  const carouselMap = useMemo(() => {
    const map = new Map<string, CarouselData>();
    if (fetchedCarousels) {
      for (const c of fetchedCarousels) {
        if (c.active) map.set(c.id, c);
      }
    }
    return map;
  }, [fetchedCarousels]);

  const getSubtype = (section: string): string | undefined => {
    if (section.startsWith("carousel_")) {
      const id = section.slice("carousel_".length);
      const c = carouselMap.get(id);
      if (!c) return undefined;
      if (c.settings?.heroStyle === "SHOWCASE") return "showcase";
      return (c.settings?.slideLayout as string) || "default";
    }
    switch (section) {
      case "hero":
        if (heroSettings?.heroStyle === "SHOWCASE") return "showcase";
        return (heroSettings?.slideLayout as string) || "default";
      case "featured":
        return featuredLayout || "GRID";
      case "cards":
        return (cardsSettings?.layout as string) || "simple";
      default:
        return undefined;
    }
  };

  const renderSection = (section: string) => {
    if (section.startsWith("carousel_")) {
      const id = section.slice("carousel_".length);
      const carousel = carouselMap.get(id);
      if (!carousel) return null;
      return renderCarousel(carousel, config?.storeName as string);
    }

    switch (section) {
      case "hero":
        return (
          <section key="hero" className="carousel-container">
            {fetchedCarousels
              ?.filter((c) => c.type === "HERO" && c.active)
              .sort((a, b) => a.order - b.order)
              .map((c) => renderCarousel(c, config?.storeName as string))}
          </section>
        );
      case "banner":
        return (
          <section key="banner" className="carousel-container">
            {fetchedCarousels
              ?.filter((c) => c.type === "BANNER" && c.active)
              .sort((a, b) => a.order - b.order)
              .map((c) => renderCarousel(c, config?.storeName as string))}
          </section>
        );
      case "featured":
        return (
          <main key="featured">
            <ProductLayout />
          </main>
        );
      case "cards":
        return (
          <section key="cards" className="carousel-container">
            {fetchedCarousels
              ?.filter((c) => c.type === "CARDS" && c.active)
              .sort((a, b) => a.order - b.order)
              .map((c) => renderCarousel(c, config?.storeName as string))}
          </section>
        );
      case "location":
        return showLocation ? (
          <section
            key="location"
            className="flex items-center justify-center p-6 py-16 border-t-2"
            style={{
              backgroundColor: secondaryColor,
              borderColor: `${primaryColor}20`,
            }}
          >
            <LocationCard
              title="Nuestra Sucursal Central"
              days="Lunes a Sábados"
              hours="09:00 hs a 20:00 hs"
              config={config as { address: string | null; city: string | null; province?: string | null; phone?: string | null; whatsapp?: string | null; mapsUrl?: string | null }}
            />
          </section>
        ) : null;
      default:
        return null;
    }
  };

  const renderWithMt = (section: string, index: number) => {
    const content = renderSection(section);
    if (!content) return null;
    const mt = index === 0 ? getSectionMt(section, getSubtype(section)) : 0;
    if (mt <= 0) return content;
    return <div key={section} className={`mt-${mt}`}>{content}</div>;
  };

  return (
    <div className="min-h-screen overflow-x-hidden max-w-full" style={{ backgroundColor: `${primaryColor}05` }}>
      {hasCustomOrder ? (
        sectionOrder.map((section, index) => renderWithMt(section, index))
      ) : (
        <>
          <AllCarousels storeName={config?.storeName as string} />

          <main className={getSectionMt("featured", getSubtype("featured")) > 0 ? `mt-${getSectionMt("featured", getSubtype("featured"))}` : ''}>
            <ProductLayout />
          </main>

          {showLocation && (
            <section
              className="flex items-center justify-center p-6 py-16 border-t-2"
              style={{
                backgroundColor: secondaryColor,
                borderColor: `${primaryColor}20`,
              }}
            >
              <LocationCard
                title="Nuestra Sucursal Central"
                days="Lunes a Sábados"
                hours="09:00 hs a 20:00 hs"
                config={config as { address: string | null; city: string | null; province?: string | null; phone?: string | null; whatsapp?: string | null; mapsUrl?: string | null }}
              />
            </section>
          )}
        </>
      )}
    </div>
  );
}
