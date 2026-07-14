// components/home/HomeClient.tsx
"use client";

import ProductLayout from "@/components/providers/products/layouts/ProductLayout";
import LocationCard from "@/components/ui/LocationCard";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import Carousel from "@/components/home/Carousel";

// Tipo para los slides (puede venir de types compartido más adelante)
type Slide = {
  id: number;
  image: string;
  title?: string | null;
  subtitle?: string | null;
  text?: string | null;
  url?: string | null;
};

interface HomeClientProps {
  pageConfig: {
    // Campos existentes que ya usabas
    address: string | null;
    city: string | null;
    province: string | null;
    phone: string | null;
    whatsapp: string | null;
    mapsUrl: string | null;
    locationEnabled: boolean;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    // Nuevos campos del carrusel
    carouselType: "HERO_SIMPLE" | "HERO_TITULO" | "HERO_TEXTO" | "HERO_LINK";
    carouselAutoplay: boolean;
    carouselInterval: number;
  } | null;
  slides: Slide[];
}

export default function HomeClient({ pageConfig, slides }: HomeClientProps) {
  const { pageConfig: contextConfig } = usePageConfig();
  const config = pageConfig || contextConfig;

  const primaryColor = config?.primaryColor || "#06b6d4";
  const secondaryColor = config?.secondaryColor || "#f8fafc";
  const showLocation = config && config.locationEnabled && config.address;

  return (
    <div className="min-h-screen overflow-x-hidden max-w-full" style={{ backgroundColor: `${primaryColor}05` }}>
      {/* Carrusel del home (reemplaza al antiguo Hero) */}
      {config && (
        <Carousel
          slides={slides}
          carouselType={config.carouselType}
          autoplay={config.carouselAutoplay}
          interval={config.carouselInterval}
        />
      )}

      <main>
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
            config={config}
          />
        </section>
      )}
    </div>
  );
}