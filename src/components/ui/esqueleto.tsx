"use client";

import type { ReactNode } from "react";
import { combinarClases } from "@/lib/utilidades/combinar-clases";

export function Esqueleto({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={combinarClases("animate-pulse rounded-md bg-[var(--admin-fondo-suave)]", className)}>
      {children}
    </div>
  );
}
