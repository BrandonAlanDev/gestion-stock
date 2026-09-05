"use client";

import ProductsTableSkeleton from "@/components/admin/productos/products-table-skeleton";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";

export default function CargandoProductos() {
  const paleta = useAdminPaleta();

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ backgroundColor: paleta.fondo }}>
      <div className="h-7 w-40 animate-pulse rounded-md" style={{ backgroundColor: paleta.fondoSuave }} />
      <div className="mt-6 rounded-xl border p-4" style={{ borderColor: paleta.borde }}>
        <div className="h-10 w-full animate-pulse rounded-xl" style={{ backgroundColor: paleta.fondoSuave }} />
      </div>
      <div className="mt-6 rounded-xl border" style={{ borderColor: paleta.borde }}>
        <ProductsTableSkeleton filas={6} />
      </div>
    </div>
  );
}
