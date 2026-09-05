"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";

export interface ItemMenu {
  etiqueta: string;
  onSeleccionar: () => void;
  icono?: LucideIcon;
  peligroso?: boolean;
  deshabilitado?: boolean;
}

export default function DropdownMenu({
  trigger,
  items,
  ariaLabel,
}: {
  trigger: ReactNode;
  items: ItemMenu[];
  ariaLabel?: string;
}) {
  const paleta = useAdminPaleta();
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const manejarClicFuera = (e: MouseEvent) => {
      if (!contenedorRef.current?.contains(e.target as Node)) setAbierto(false);
    };
    const manejarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", manejarClicFuera);
    document.addEventListener("keydown", manejarTecla);
    return () => {
      document.removeEventListener("mousedown", manejarClicFuera);
      document.removeEventListener("keydown", manejarTecla);
    };
  }, []);

  return (
    <span className="relative inline-flex" ref={contenedorRef}>
      <span
        onClick={(e) => {
          e.stopPropagation();
          setAbierto((o) => !o);
        }}
        aria-label={ariaLabel}
        aria-expanded={abierto}
      >
        {trigger}
      </span>

      {abierto && (
        <div
          className="absolute right-0 z-40 mt-2 min-w-48 overflow-hidden rounded-xl border py-1 shadow-lg"
          style={{ backgroundColor: paleta.fondo, borderColor: paleta.borde }}
        >
          {items.map((item, indice) => (
            <button
              key={indice}
              role="menuitem"
              disabled={item.deshabilitado}
              onClick={(e) => {
                e.stopPropagation();
                if (item.deshabilitado) return;
                setAbierto(false);
                item.onSeleccionar();
              }}
              onMouseEnter={(e) => {
                if (item.deshabilitado) return;
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = paleta.fondoHover;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: item.peligroso ? "#ef4444" : paleta.texto }}
            >
              {item.icono && <item.icono size={15} />}
              {item.etiqueta}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
