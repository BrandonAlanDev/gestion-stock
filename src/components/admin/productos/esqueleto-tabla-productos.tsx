"use client";

import { Esqueleto } from "@/components/ui/esqueleto";

interface EsqueletoTablaProductosProps {
  filas?: number;
}

export default function EsqueletoTablaProductos({ filas = 6 }: EsqueletoTablaProductosProps) {
  return (
    <div role="status" aria-label="Cargando lista de productos">
      <div aria-hidden="true" className="hidden overflow-hidden rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] xl:block">
        <div className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))_80px] gap-4 border-b border-[var(--admin-borde)] px-4 py-3">{Array.from({ length: 6 }, (_, indice) => <Esqueleto key={indice} className="h-4 w-20 max-w-full" />)}</div>
        {Array.from({ length: filas }, (_, indice) => <div key={indice} className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))_80px] items-center gap-4 border-b border-[var(--admin-borde)] px-4 py-3 last:border-0"><div className="flex items-center gap-3"><Esqueleto className="h-11 w-11 shrink-0 rounded-lg" /><div className="min-w-0 flex-1 space-y-2"><Esqueleto className="h-4 w-4/5" /><Esqueleto className="h-3 w-1/2" /></div></div>{Array.from({ length: 5 }, (_, columna) => <Esqueleto key={columna} className="h-4 w-4/5" />)}</div>)}
      </div>
      <div aria-hidden="true" className="space-y-2 xl:hidden">{Array.from({ length: filas }, (_, indice) => <div key={indice} className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-4"><div className="flex items-center gap-3"><Esqueleto className="h-12 w-12 shrink-0 rounded-lg" /><div className="flex-1 space-y-2"><Esqueleto className="h-4 w-2/3" /><Esqueleto className="h-3 w-1/3" /></div><Esqueleto className="h-8 w-8" /></div><div className="mt-4 flex gap-4 border-t border-[var(--admin-borde)] pt-3"><Esqueleto className="h-4 w-24" /><Esqueleto className="h-4 w-20" /></div></div>)}</div>
      <span className="sr-only">Cargando lista de productos...</span>
    </div>
  );
}
