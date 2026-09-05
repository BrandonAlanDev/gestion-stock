"use client";

import type { ReactNode } from "react";

export function Tooltip({ children, contenido }: { children: ReactNode; contenido: string }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-1.5 text-xs font-medium text-[var(--admin-texto)] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      >
        {contenido}
      </span>
    </span>
  );
}
