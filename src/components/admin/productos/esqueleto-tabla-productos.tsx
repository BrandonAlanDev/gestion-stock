"use client";

import { Esqueleto } from "@/components/ui/esqueleto";

interface EsqueletoTablaProductosProps {
  filas?: number;
}

export default function EsqueletoTablaProductos({ filas = 6 }: EsqueletoTablaProductosProps) {
  return (
    <div>
      {Array.from({ length: filas }).map((_, indice) => (
        <div
          key={indice}
          className="flex items-center gap-4 border-b border-[var(--admin-borde)] py-4 last:border-b-0"
        >
          <Esqueleto className="h-11 w-11 rounded-xl" />
          <div className="flex-1">
            <Esqueleto className="h-3.5 w-1/2" />
            <Esqueleto className="mt-2 h-3 w-1/4" />
          </div>
          <Esqueleto className="h-3.5 w-20" />
          <Esqueleto className="h-3.5 w-16" />
          <Esqueleto className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
