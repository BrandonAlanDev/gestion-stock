"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { combinarClases } from "@/lib/utilidades/combinar-clases";

export interface ItemMenu {
  etiqueta: string;
  onSeleccionar: () => void;
  icono?: LucideIcon;
  peligroso?: boolean;
  deshabilitado?: boolean;
}

export default function MenuDesplegable({
  activador,
  elementos,
  etiquetaAria,
}: {
  activador: ReactNode;
  elementos: ItemMenu[];
  etiquetaAria?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const manejarClicFuera = (evento: MouseEvent) => {
      if (!contenedorRef.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const manejarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
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
        onClick={(evento) => {
          evento.stopPropagation();
          setAbierto((estadoAnterior) => !estadoAnterior);
        }}
        aria-label={etiquetaAria}
        aria-expanded={abierto}
      >
        {activador}
      </span>

      {abierto && (
        <div
          className="absolute right-0 z-40 mt-2 min-w-48 overflow-hidden rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] py-1 shadow-lg"
        >
          {elementos.map((elemento, indice) => (
            <button
              key={indice}
              role="menuitem"
              disabled={elemento.deshabilitado}
              onClick={(evento) => {
                evento.stopPropagation();
                if (elemento.deshabilitado) return;
                setAbierto(false);
                elemento.onSeleccionar();
              }}
              className={combinarClases(
                "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[var(--admin-fondo-hover)]",
                elemento.peligroso ? "text-[var(--admin-peligro)]" : "text-[var(--admin-texto)]"
              )}
            >
              {elemento.icono && <elemento.icono size={15} />}
              {elemento.etiqueta}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
