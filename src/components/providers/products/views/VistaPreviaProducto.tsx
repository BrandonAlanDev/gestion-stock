"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { leerVistaPreviaProducto } from "@/lib/productos/cache-cliente";
import { imagenAdmiteOptimizacion } from "@/lib/utilidades/imagen-admite-optimizacion";
import { SkeletonTienda } from "@/components/ui/skeleton-vistas";
import { useTenantPublico } from "@/contextos/tienda/contexto-tenant-publico";

type VistaProducto = NonNullable<ReturnType<typeof leerVistaPreviaProducto>>;

export default function VistaPreviaProducto() {
  const pathname = usePathname();
  const tenantId = useTenantPublico();
  const id = pathname.split("/").filter(Boolean).at(-1) || "";
  const [producto, setProducto] = useState<VistaProducto | null>(null);

  useEffect(() => {
    setProducto(tenantId ? leerVistaPreviaProducto(tenantId, id) : null);
  }, [tenantId, id]);

  if (!producto) return <SkeletonTienda tipo="producto" />;

  const imagen = producto.images[0]?.srcImage || "/images/placeholder.svg";

  return (
    <div className="min-h-screen bg-[var(--color-fondo-sitio)] px-4 pb-20 pt-28 text-[var(--texto-sobre-fondo)]" aria-busy="true">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
        <div className="relative aspect-[4/5] rounded-xl bg-[var(--superficie-imagen)]">
          <Image src={imagen} alt={producto.name} fill sizes="(max-width: 1024px) 100vw, 50vw" unoptimized={!imagenAdmiteOptimizacion(imagen)} className="object-contain p-8" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{producto.name}</h1>
          <p className="mt-4 text-sm opacity-70">Verificando precio y disponibilidad…</p>
        </div>
      </div>
    </div>
  );
}
