"use client";

import AllCarousels from "@/components/carousel/AllCarousels";
import CarouselContainer from "@/components/carousel/CarouselContainer";
import ProductLayout from "@/components/providers/products/layouts/ProductLayout";
import LocationCard from "@/components/ui/LocationCard";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getSectionMt } from "@/lib/section-mt";

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
    try { return JSON.parse(raw); } catch { /* fall through */ }
  }
  return [];
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

  const getSubtype = (section: string): string | undefined => {
    switch (section) {
      case "hero":
        if (heroSettings?.heroStyle === "SHOWCASE") return "showcase";
        return (heroSettings?.slideLayout as string) || "default";
      case "featured":
        return featuredLayout || "GRID";
      case "cards":
        return (cardsSettings?.layout as string) || "grid";
      default:
        return undefined;
    }
  };

  const renderSection = (section: string) => {
    switch (section) {
      case "hero":
        return <CarouselContainer key="hero" filterType="HERO" />;
      case "banner":
        return <CarouselContainer key="banner" filterType="BANNER" />;
      case "featured":
        return (
          <main key="featured">
            <ProductLayout />
          </main>
        );
      case "cards":
        return <CarouselContainer key="cards" filterType="CARDS" />;
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
          <AllCarousels />

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
