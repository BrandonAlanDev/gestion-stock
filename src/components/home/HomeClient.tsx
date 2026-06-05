"use client";

import ProductLayout from "@/components/products/layouts/ProductLayout";
import LocationCard from "@/components/ui/LocationCard";

export default function HomeClient() {
  return (
    // CORREGIDO: Se quitó justify-center/items-center del contenedor principal para que los bloques apilen hacia abajo normalmente.
    // Se cambió max-w-dvw por max-w-full u overflow-x-hidden para evitar scroll horizontal raro.
    <div className="min-h-screen bg-blue-50 overflow-x-hidden max-w-full">
      
      <main>
        <ProductLayout />
      </main>
      <section className="flex items-center justify-center bg-[#f0fafa] p-6 py-16">
        <LocationCard
          title="Nuestra Sucursal Central"
          address="Av. Montreal 1153"
          city="Santa Clara del Mar, Buenos Aires"
          days="Lunes a Sábados"
          hours="09:00 hs a 20:00 hs"
          phone="+54 223 XXX-XXXX" // Acuérdate de cambiar el prefijo al de Santa Clara/Mardel (223) si usas teléfono local!
          googleMapsUrl="https://maps.google.com/?q=Av.+Montreal+1153,+Santa+Clara+del+Mar"
        />
      </section>

    </div>
  );
}