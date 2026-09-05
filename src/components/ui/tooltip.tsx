"use client";

import type { ReactNode } from "react";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";

export function Tooltip({ children, contenido }: { children: ReactNode; contenido: string }) {
  const paleta = useAdminPaleta();

  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        style={{ backgroundColor: paleta.fondo, color: paleta.texto, border: `1px solid ${paleta.borde}` }}
      >
        {contenido}
      </span>
    </span>
  );
}
