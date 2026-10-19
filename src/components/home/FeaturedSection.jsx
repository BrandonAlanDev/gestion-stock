"use client";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
import LayoutGrid from "./LayoutGrid";
import LayoutCollage from "./LayoutCollage";
import LayoutMinimal from "./LayoutMinimal";
import mapearGridATarjeta from "@/lib/grillas/mapear-grid-a-tarjeta";

export default function FeaturedSection({ homegrid }) {
  const { pageConfig } = usePageConfig();
  const config = pageConfig?.pageConfig ?? pageConfig;
  const datos = homegrid ?? config?.homegrid;

  const layout = datos?.featuredLayout?.toLowerCase() || "grid";
  const categories = (datos?.grids || []).map(mapearGridATarjeta);

  if (categories.length === 0) return null;

  const renderLayout = () => {
    switch (layout) {
      case "collage": return <LayoutCollage categories={categories} />;
      case "minimal": return <LayoutMinimal categories={categories} />;
      default: return <LayoutGrid categories={categories} />;
    }
  };

  return (
    <section className="w-full overflow-hidden border-t border-current/10 bg-[var(--color-fondo-sitio)] py-12 sm:py-16">
      {datos?.title?.trim() ? (
        <div className="mx-auto mb-7 max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--texto-sobre-fondo)] sm:text-3xl">
            {datos.title}
          </h2>
        </div>
      ) : null}
      {renderLayout()}
    </section>
  );
}
