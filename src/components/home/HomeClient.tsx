"use client";

import { useMemo, type ComponentProps } from "react";
import { useQuery } from "@tanstack/react-query";
import HeroLayout from "@/components/carousel/layouts/hero/HeroLayout";
import BannerLayout from "@/components/carousel/layouts/banner/BannerLayout";
import CardsLayout from "@/components/carousel/layouts/cards/CardsLayout";
import ShowcaseLayout from "@/components/carousel/layouts/hero/ShowcaseLayout";
import AllCarousels from "@/components/carousel/AllCarousels";
import FeaturedSection from "@/components/home/FeaturedSection";
import LocationCard from "@/components/ui/LocationCard";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import type { CategoriaCatalogo } from "@/types/productos/catalogo-publico";
import type { DatosGrid } from "@/lib/grillas/mapear-grid-a-tarjeta";
import { normalizarEnlaceCategoriaPublico } from "@/lib/categorias/normalizar-enlace-categoria";

interface CarouselSlide {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  url?: string;
  config?: { hideText?: boolean; linkType?: string };
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

interface HomegridRender {
  id?: string;
  title?: string | null;
  subtitle?: string | null;
  style?: string;
  columns?: number | null;
  active?: boolean;
  featuredLayout?: string | null;
  grids?: DatosGrid[];
  [k: string]: unknown;
}

interface HomeClientProps {
  carouselsIniciales?: CarouselData[];
  categorias: CategoriaCatalogo[];
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

function renderCarousel(carousel: CarouselData, storeName: string | undefined, categorias: CategoriaCatalogo[]) {
  const carrusel = {
    ...carousel,
    slides: carousel.slides.map((slide) => {
      const url = normalizarEnlaceCategoriaPublico(slide.url, slide.config?.linkType, categorias);
      return url === undefined ? slide : { ...slide, url: url ?? "" };
    }),
  };
  const isShowcase = carrusel.settings?.heroStyle === "SHOWCASE";
  switch (carrusel.type) {
    case "HERO":
      return isShowcase
        ? <ShowcaseLayout key={carrusel.id} carousel={carrusel as unknown as ComponentProps<typeof ShowcaseLayout>["carousel"]} />
        : <HeroLayout key={carrusel.id} carousel={carrusel as unknown as ComponentProps<typeof HeroLayout>["carousel"]} />;
    case "BANNER":
      return isShowcase
        ? <ShowcaseLayout key={carrusel.id} carousel={carrusel as unknown as ComponentProps<typeof ShowcaseLayout>["carousel"]} />
        : <BannerLayout key={carrusel.id} carousel={carrusel as unknown as ComponentProps<typeof BannerLayout>["carousel"]} />;
    case "CARDS":
      return isShowcase
        ? <ShowcaseLayout key={carrusel.id} carousel={carrusel as unknown as ComponentProps<typeof ShowcaseLayout>["carousel"]} />
        : <CardsLayout key={carrusel.id} carousel={carrusel as unknown as ComponentProps<typeof CardsLayout>["carousel"]} storeName={storeName} />;
    default:
      return null;
  }
}

const PREFIJO_DESTACADA = "featured_";

export default function HomeClient({ pageConfig, carouselsIniciales, categorias }: HomeClientProps) {
  const { pageConfig: contextConfig } = usePageConfig();
  const config = (pageConfig || contextConfig) as Record<string, unknown>;

  const showLocation = config?.locationEnabled && config?.address;

  const sectionOrder = parseSectionOrder(config?.sectionOrder);
  const hasCustomOrder = sectionOrder.length > 0;

  const homegridPorId = useMemo(() => {
    const homegrids =
      (config?.homegrids as Array<Record<string, unknown>> | undefined) || [];
    return new Map(homegrids.map((h) => [String(h.id), h as HomegridRender]));
  }, [config]);

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
    gcTime: 10 * 60_000,
    enabled: isNewFormat,
    initialData: carouselsIniciales,
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

  const renderSection = (section: string) => {
    if (section.startsWith("carousel_")) {
      const id = section.slice("carousel_".length);
      const carousel = carouselMap.get(id);
      if (!carousel) return null;
      return renderCarousel(carousel, config?.storeName as string, categorias);
    }

    if (section.startsWith(PREFIJO_DESTACADA)) {
      const hg = homegridPorId.get(section.slice(PREFIJO_DESTACADA.length));
      if (!hg || hg.active === false) return null;
      return <FeaturedSection key={section} homegrid={hg} categorias={categorias} />;
    }

    switch (section) {
      case "hero":
        return (
          <section key="hero" className="carousel-container">
            {fetchedCarousels
              ?.filter((c) => c.type === "HERO" && c.active)
              .sort((a, b) => a.order - b.order)
              .map((c) => renderCarousel(c, config?.storeName as string, categorias))}
          </section>
        );
      case "banner":
        return (
          <section key="banner" className="carousel-container">
            {fetchedCarousels
              ?.filter((c) => c.type === "BANNER" && c.active)
              .sort((a, b) => a.order - b.order)
              .map((c) => renderCarousel(c, config?.storeName as string, categorias))}
          </section>
        );
      case "featured":
        return <FeaturedSection key="featured" homegrid={config?.homegrid as HomegridRender | undefined} categorias={categorias} />;
      case "cards":
        return (
          <section key="cards" className="carousel-container">
            {fetchedCarousels
              ?.filter((c) => c.type === "CARDS" && c.active)
              .sort((a, b) => a.order - b.order)
              .map((c) => renderCarousel(c, config?.storeName as string, categorias))}
          </section>
        );
      case "location":
        return showLocation ? (
          <section
            key="location"
            className="flex items-center justify-center p-6 py-16 border-t-2"
            style={{
              backgroundColor: "var(--color-fondo-sitio)",
              borderColor: "var(--color-primario)",
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

  return (
    <div className="inicio-contenido min-h-screen max-w-full overflow-x-hidden pt-16" style={{ backgroundColor: "var(--color-fondo-sitio)" }}>
      {hasCustomOrder ? (
        sectionOrder.map((section) => renderSection(section))
      ) : (
        <>
          <AllCarousels storeName={config?.storeName as string} initialCarousels={carouselsIniciales as ComponentProps<typeof AllCarousels>["initialCarousels"]} categorias={categorias} />

          <FeaturedSection homegrid={config?.homegrid as HomegridRender | undefined} categorias={categorias} />

          {showLocation && (
            <section
              className="flex items-center justify-center p-6 py-16 border-t-2"
              style={{
                backgroundColor: "var(--color-fondo-sitio)",
                borderColor: "var(--color-primario)",
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
