"use client";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
import LayoutGrid from "./LayoutGrid";
import LayoutCollage from "./LayoutCollage";
import LayoutMinimal from "./LayoutMinimal";
import mapGridToCard from "@/helpers/GridToCard";

export default function FeaturedSection({ homegrid }) {
  const { pageConfig } = usePageConfig();
  const config = pageConfig?.pageConfig ?? pageConfig;
  const datos = homegrid ?? config?.homegrid;

  const layout = (datos?.featuredLayout?.toLowerCase() || "grid");

  const categories = (datos?.grids || []).map(mapGridToCard);

  if (categories.length === 0) return null;

  const renderLayout = () => {
    switch (layout) {
      case "collage": return <LayoutCollage categories={categories} />;
      case "minimal": return <LayoutMinimal categories={categories} />;
      default: return <LayoutGrid categories={categories} />;
    }
  };

  return (
    <section className="w-full bg-[var(--color-fondo-sitio)] py-16 border-t-2 overflow-hidden" style={{ borderColor: "var(--color-primario)" }}>
      {datos?.title?.trim() ? (
        <div className="w-full px-4 md:px-12 lg:px-16 mb-12">
          <h2 className="text-4xl md:text-6xl font-black text-[var(--texto-sobre-fondo)] uppercase italic">
            {datos.title}
          </h2>
        </div>
      ) : null}
      {renderLayout()}
    </section>
  );
}
