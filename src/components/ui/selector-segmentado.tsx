"use client";

import { cn } from "@/lib/utils";

interface OpcionSegmentada {
  valor: string;
  etiqueta: string;
}

interface SelectorSegmentadoProps {
  opciones: OpcionSegmentada[];
  valor: string;
  alCambiar: (valor: string) => void;
  deshabilitado?: boolean;
}

export default function SelectorSegmentado({
  opciones,
  valor,
  alCambiar,
  deshabilitado,
}: SelectorSegmentadoProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-1 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-1 sm:w-auto sm:inline-flex",
        deshabilitado && "pointer-events-none opacity-50",
      )}
    >
      {opciones.map((opcion) => {
        const activo = opcion.valor === valor;
        return (
          <button
            key={opcion.valor}
            type="button"
            aria-pressed={activo}
            onClick={() => alCambiar(opcion.valor)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition sm:flex-none",
              activo
                ? "bg-[var(--admin-primario)] text-[var(--admin-primario-texto)]"
                : "text-[var(--admin-texto-suave)] hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]",
            )}
          >
            {opcion.etiqueta}
          </button>
        );
      })}
    </div>
  );
}
