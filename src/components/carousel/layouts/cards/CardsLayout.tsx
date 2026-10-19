"use client";

import CardsLayoutSimple from "./CardsLayoutSimple";
import OfferCarousel from "./offer-carousel/OfferCarousel";
import { resolverEnlaceSlide } from "@/lib/enlaces/resolver-enlace-slide";

interface CarouselSlide {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  url?: string;
  config?: Record<string, unknown>;
}

interface CardsLayoutProps {
  carousel: {
    id: string;
    title?: string;
      settings: {
        layout?: "simple" | "offers";
        columns?: string;
        cardHeight?: string;
        showSubtitle?: boolean;
        enableHoverZoom?: boolean;
        autoplayDelay?: number;
        gap?: number;
        height?: number;
        hideButtons?: boolean;
      };
    slides: CarouselSlide[];
  };
  storeName?: string;
}

function mapSlidesToOfferItems(slides: CarouselSlide[]) {
  return slides.map((s) => ({
    id: s.id,
    image: s.image,
    title: s.title || "",
    subtitle: s.subtitle,
    description: s.description,
    discount: (s.config?.discount as number) || undefined,
    buttonText: s.ctaText,
    href: resolverEnlaceSlide(s) ?? undefined,
    hideButton: (s.config?.hideButton as boolean) || undefined,
  }));
}

export default function CardsLayout({ carousel, storeName }: CardsLayoutProps) {
  const { settings, slides, title } = carousel;
  const layout = settings.layout || "simple";

  if (slides.length === 0) return null;

  const headerSection = title ? (
    <div className="mx-auto mb-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-current/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mb-1 block text-sm text-[var(--texto-sobre-fondo)] opacity-70">
            {storeName || "Tienda"}
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--texto-sobre-fondo)] sm:text-3xl">
            {title}
          </h2>
        </div>
      </div>
    </div>
  ) : null;

  if (layout === "offers") {
    return (
      <section className="w-full border-t border-current/10 bg-[var(--color-fondo-sitio)] py-12 sm:py-16">
        {headerSection}
        <OfferCarousel
          title={title}
          items={mapSlidesToOfferItems(slides)}
          autoplayDelay={settings.autoplayDelay || 5000}
          hideButtons={settings.hideButtons}
          hideHeader
        />
      </section>
    );
  }

  return (
    <section id="featured" className="w-full border-t border-current/10 bg-[var(--color-fondo-sitio)] py-12 sm:py-16">
      {headerSection}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <CardsLayoutSimple slides={slides} settings={settings} />
      </div>
    </section>
  );
}
