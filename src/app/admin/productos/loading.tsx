"use client";

import EsqueletoTablaProductos from "@/components/admin/productos/esqueleto-tabla-productos";

export default function CargandoProductos() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="h-7 w-40 animate-pulse rounded-md bg-[var(--admin-fondo-suave)]" />
      <div className="mt-6 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-4">
        <div className="h-10 w-full animate-pulse rounded-xl bg-[var(--admin-fondo)]" />
      </div>
      <div className="mt-6 rounded-xl border border-[var(--admin-borde)]">
        <EsqueletoTablaProductos filas={6} />
      </div>
    </div>
  );
}
