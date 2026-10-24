"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/providers/products/cards/ProductCard";
import { leerPaginaCatalogo } from "@/lib/productos/cache-cliente";
import { SkeletonTienda } from "@/components/ui/skeleton-vistas";
import { useTenantPublico } from "@/contextos/tienda/contexto-tenant-publico";

type VistaCatalogo = NonNullable<ReturnType<typeof leerPaginaCatalogo>>;

export default function VistaPreviaCatalogo() {
  const parametros = useSearchParams();
  const tenantId = useTenantPublico();
  const pagina = Math.min(100, Math.max(1, Math.trunc(Number(parametros.get("page"))) || 1));
  const categoria = parametros.get("categoria") || undefined;
  const subcategoria = parametros.get("subcategoria") || undefined;
  const [vista, setVista] = useState<VistaCatalogo | null>(null);

  useEffect(() => {
    setVista(tenantId ? leerPaginaCatalogo(tenantId, pagina, categoria, subcategoria) : null);
  }, [tenantId, pagina, categoria, subcategoria]);

  if (!vista) return <SkeletonTienda />;

  return (
    <div className="min-h-screen bg-[var(--color-fondo-sitio)] px-4 pt-28 text-[var(--texto-sobre-fondo)]" aria-busy="true">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-semibold">Productos</h1>
        <p className="mb-8 text-sm opacity-70">Actualizando catálogo y disponibilidad…</p>
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
          {vista.productos.map((producto, indice) => <ProductCard key={producto.id} product={producto} priority={indice < 3} />)}
        </div>
      </div>
    </div>
  );
}
