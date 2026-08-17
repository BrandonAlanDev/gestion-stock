"use client";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
import LayoutGrid from "./LayoutGrid";
import LayoutCollage from "./LayoutCollage";
import LayoutMinimal from "./LayoutMinimal";
import mapGridToCard from "@/helpers/GridToCard";

export default function FeaturedSection() {
  const { pageConfig } = usePageConfig();
  const config = pageConfig?.pageConfig ?? pageConfig;

  // 1. Obtenemos el layout desde la BD
  const layout = config?.featuredLayout?.toLowerCase() || "grid";

  // 2. Obtenemos los datos dinámicos desde el modelo Homegrid
  // Ajusta esto según cómo venga tu objeto pageConfig (probablemente pageConfig.homegrid)
  const homeData = config?.homegrid;
  const categories = (homeData?.grids || []).map(mapGridToCard);

  if (categories.length === 0) return null; // O un skeleton

  const renderLayout = () => {
    switch (layout) {
      case "collage": return <LayoutCollage categories={categories} />;
      case "minimal": return <LayoutMinimal categories={categories} />;
      default: return <LayoutGrid categories={categories} />;
    }
  };

  return (
    <section className="w-full bg-[var(--color-fondo-sitio)] py-16 border-t-2" style={{ borderColor: "var(--color-primario)" }}>
      <div className="w-full px-4 md:px-12 lg:px-16 mb-12">
        <h2 className="text-4xl md:text-6xl font-black text-[var(--texto-sobre-fondo)] uppercase italic">
          {homeData?.title || "CATALOGO Y SERVICIOS"}
        </h2>
      </div>
      {renderLayout()}
    </section>
  );
}
