"use client";

import EsqueletoTablaProductos from "@/components/admin/productos/esqueleto-tabla-productos";
import { Esqueleto } from "@/components/ui/esqueleto";

export default function CargandoProductos() {
  return (
    <div role="status" aria-label="Cargando productos" className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div aria-hidden="true">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="space-y-2"><Esqueleto className="h-7 w-40" /><Esqueleto className="h-4 w-72 max-w-full" /></div><Esqueleto className="h-11 w-full sm:w-44" /></div>
        <div className="mt-6 space-y-3 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-4"><Esqueleto className="h-11 w-full" /><div className="flex flex-wrap gap-2"><Esqueleto className="h-9 w-28" /><Esqueleto className="h-9 w-28" /><Esqueleto className="ml-auto h-9 w-36" /></div></div>
        <div className="mt-4"><EsqueletoTablaProductos filas={6} /></div>
      </div>
      <span className="sr-only">Cargando productos...</span>
    </div>
  );
}
