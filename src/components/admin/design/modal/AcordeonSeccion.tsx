"use client";

import type { ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AcordeonSeccionProps {
  abierto: boolean;
  alAlternar: () => void;
  titulo: string;
  icono: LucideIcon;
  id: string;
  children: ReactNode;
  textColor: string;
}

export default function AcordeonSeccion({
  abierto,
  alAlternar,
  titulo,
  icono: Icono,
  id,
  children,
  textColor,
}: AcordeonSeccionProps) {
  return (
    <div
      className="overflow-hidden rounded-xl border transition-colors duration-200"
      style={{ borderColor: textColor + "20" }}
    >
      <button
        type="button"
        onClick={alAlternar}
        aria-expanded={abierto}
        aria-controls={id}
        className="flex w-full items-center justify-between px-4 py-3 cursor-pointer"
      >
        <span
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: textColor + "CC" }}
        >
          <Icono size={16} style={{ color: textColor + "80" }} />
          {titulo}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "transition-transform duration-200",
            abierto && "rotate-180"
          )}
          style={{ color: textColor + "80" }}
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
