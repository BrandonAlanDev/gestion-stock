"use client";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
import LayoutGrid from "./LayoutGrid";
import LayoutCollage from "./LayoutCollage";
import LayoutMinimal from "./LayoutMinimal";

export default function FeaturedSection() {
  const { pageConfig } = usePageConfig();
  
  // 1. Obtenemos el layout desde la BD
  const primaryColor = pageConfig?.primaryColor || "#06b6d4";
  const layout = pageConfig?.featuredLayout?.toLowerCase() || "grid";

  // 2. Obtenemos los datos dinámicos desde el modelo Homegrid
  // Ajusta esto según cómo venga tu objeto pageConfig (probablemente pageConfig.homegrid)
  const homeData = pageConfig?.homegrid; 
  const categories = homeData?.grids || []; // Si no hay datos, array vacío

  if (categories.length === 0) return null; // O un skeleton

  const renderLayout = () => {
    switch (layout) {
      case "collage": return <LayoutCollage categories={categories} primaryColor={primaryColor} />;
      case "minimal": return <LayoutMinimal categories={categories} primaryColor={primaryColor} />;
      default: return <LayoutGrid categories={categories} primaryColor={primaryColor} />;
    }
  };

  return (
    <section className="w-full bg-white py-16 border-t-2" style={{ borderColor: primaryColor }}>
      <div className="w-full px-4 md:px-12 lg:px-16 mb-12">
        <h2 className="text-4xl md:text-6xl font-black text-black uppercase italic">
          {homeData?.title || "CATALOGO Y SERVICIOS"}
        </h2>
      </div>
      {renderLayout()}
    </section>
  );
}