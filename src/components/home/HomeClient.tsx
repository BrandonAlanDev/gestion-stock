"use client";

import ProductLayout from "@/components/providers/products/layouts/ProductLayout";
import LocationCard from "@/components/ui/LocationCard";
import { usePageConfig } from "@/components/providers/PageConfigProvider";

interface HomeClientProps {
  pageConfig: {
    address: string | null;
    city: string | null;
    province: string | null;
    phone: string | null;
    whatsapp: string | null;
    mapsUrl: string | null;
    locationEnabled: boolean;
    primaryColor?: string;
    secondaryColor?: string;
  } | null;
}

export default function HomeClient({ pageConfig }: HomeClientProps) {
  const { pageConfig: contextConfig } = usePageConfig();
  const config = pageConfig || contextConfig;
  
  const primaryColor = config?.primaryColor || "#06b6d4";
  const secondaryColor = config?.secondaryColor || "#f8fafc"; // Un tono neutro suave por defecto
  const showLocation = config && config.locationEnabled && config.address;

  return (
    <div className="min-h-screen overflow-x-hidden max-w-full" style={{ backgroundColor: `${primaryColor}05` }}>
      
      <main>
        <ProductLayout />
      </main>

      {showLocation && (
        <section 
          className="flex items-center justify-center p-6 py-16 border-t-2" 
          style={{ 
            backgroundColor: secondaryColor,
            borderColor: `${primaryColor}20` 
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