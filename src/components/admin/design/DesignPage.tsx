"use client";

import { useState } from "react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { ImageIcon, Grid2X2, LayoutDashboard, ListOrdered } from "lucide-react";
import type { Carousel } from "@/types/carousel";
import BrandingSection from "./BrandingSection";
import HomeSectionsDesign from "./HomeSectionsDesign";
import CarouselManager from "@/components/admin/carousel/CarouselManager";
import PageOrderSection from "./PageOrderSection";
import CollapsibleSection from "./CollapsibleSection";

interface DesignPageProps {
  pageConfig: Record<string, unknown> | null;
}

export default function DesignPage({ pageConfig: initialConfig }: DesignPageProps) {
  const { pageConfig: contextConfig } = usePageConfig();
  const config = { ...initialConfig, ...contextConfig } as Record<string, unknown>;
  const [carousels, setCarousels] = useState<Carousel[] | null>(null);

  const primaryColor = (config?.primaryColor as string) || "#06b6d4";
  const secondaryColor = (config?.secondaryColor as string) || "#fafafa";

  return (
    <div className="space-y-6">
      <CollapsibleSection
        title="Branding"
        subtitle="Logos · Colores · Apariencia"
        icon={ImageIcon}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      >
        <div className="p-8">
          <BrandingSection
            config={config}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Contenido Dinámico"
        subtitle="Portada principal · Franja publicitaria · Tarjetas destacadas"
        icon={LayoutDashboard}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      >
        <div className="p-8">
          <CarouselManager
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            onCarouselsChange={setCarousels}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Sección Destacada"
        subtitle="Cuadrícula · Mosaico · Minimalista"
        icon={Grid2X2}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      >
        <div className="p-8">
          <HomeSectionsDesign
            config={config}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Orden de Página"
        subtitle="Arrastra para reordenar secciones"
        icon={ListOrdered}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      >
        <div className="p-8">
          <PageOrderSection
            config={config}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            carousels={carousels}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}
