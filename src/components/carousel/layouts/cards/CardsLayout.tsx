"use client";

import CardsLayoutSimple from "./CardsLayoutSimple";
import OfferCarousel from "./offer-carousel/OfferCarousel";
import { resolverEnlaceSlide } from "@/helpers/enlaceSlide";

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
  primaryColor?: string;
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

export default function CardsLayout({ carousel, primaryColor = "#06b6d4", storeName }: CardsLayoutProps) {
  const { settings, slides, title } = carousel;
  const layout = settings.layout || "simple";

  if (slides.length === 0) return null;

  const headerSection = title ? (
    <div className="w-full px-4 md:px-12 lg:px-16 mb-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b-2 pb-6" style={{ borderColor: primaryColor }}>
        <div>
          <span className="text-[10px] font-black tracking-[0.4em] text-neutral-400 uppercase block mb-1">
            {storeName || "NEW SURF BOARD"}
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-black tracking-tighter uppercase italic leading-none">
            {title}
          </h2>
        </div>
      </div>
    </div>
  ) : null;

  if (layout === "offers") {
    return (
      <section className="w-full bg-white py-16 border-t-2" style={{ borderColor: primaryColor }}>
        {headerSection}
        <OfferCarousel
          title={title}
          items={mapSlidesToOfferItems(slides)}
          primaryColor={primaryColor}
          autoplayDelay={settings.autoplayDelay || 5000}
          hideButtons={settings.hideButtons}
          hideHeader
        />
      </section>
    );
  }

  return (
    <section id="featured" className="w-full bg-white py-16 border-t-2" style={{ borderColor: primaryColor }}>
      {headerSection}
      <div className="w-full px-4 md:px-12 lg:px-16">
        <CardsLayoutSimple slides={slides} settings={settings} primaryColor={primaryColor} />
      </div>
    </section>
  );
}