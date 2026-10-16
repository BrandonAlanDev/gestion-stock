"use client";

import type { ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";

interface AcordeonSeccionProps {
  abierto: boolean;
  alAlternar: () => void;
  titulo: string;
  icono: LucideIcon;
  id: string;
  children: ReactNode;
}

export default function AcordeonSeccion({
  abierto,
  alAlternar,
  titulo,
  icono: Icono,
  id,
  children,
}: AcordeonSeccionProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--admin-borde)] transition-colors duration-200">
      <button
        type="button"
        onClick={alAlternar}
        aria-expanded={abierto}
        aria-controls={id}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-[var(--admin-texto)] transition-colors hover:bg-[var(--admin-fondo-hover)]"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Icono size={16} className="text-[var(--admin-texto-suave)]" />
          {titulo}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "text-[var(--admin-texto-suave)] transition-transform duration-200",
            abierto && "rotate-180"
          )}
        />
      </button>

      <div
        id={id}
        className={cn(
          "grid transition-all duration-200",
          abierto ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 px-4 pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
