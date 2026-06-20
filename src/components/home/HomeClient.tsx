"use client";

import ProductLayout from "@/components/products/layouts/ProductLayout";
import LocationCard from "@/components/ui/LocationCard";

interface HomeClientProps {
  pageConfig: {
    address: string | null;
    city: string | null;
    province: string | null;
    phone: string | null;
    whatsapp: string | null;
    mapsUrl: string | null;
    locationEnabled: boolean;
  } | null;
}

export default function HomeClient({ pageConfig }: HomeClientProps) {
  
  const showLocation = pageConfig && pageConfig.locationEnabled && pageConfig.address;

  return (
    <div className="min-h-screen bg-blue-50 overflow-x-hidden max-w-full">
      
      <main>
        <ProductLayout />
      </main>

      {showLocation && (
        <section className="flex items-center justify-center bg-[#f0fafa] p-6 py-16">
          <LocationCard
            title="Nuestra Sucursal Central"
            days="Lunes a Sábados"
            hours="09:00 hs a 20:00 hs"
            config={pageConfig}
          />
        </section>
      )}

    </div>
  );
}