"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLASE_SELECT } from "@/lib/productos/estilos";

interface OpcionSelect {
  valor: string;
  etiqueta: string;
}

interface SelectTemadoProps {
  valor: string;
  opciones: OpcionSelect[];
  placeholder?: string;
  disabled?: boolean;
  onCambiar: (valor: string) => void;
  className?: string;
  ariaLabel?: string;
}

export default function SelectTemado({
  valor,
  opciones,
  placeholder = "Seleccionar...",
  disabled,
  onCambiar,
  className,
  ariaLabel,
}: SelectTemadoProps) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const manejarClickFuera = (evento: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, [abierto]);

  const seleccionada = opciones.find((opcion) => opcion.valor === valor);
  const mostrarPlaceholder = valor === "" || !seleccionada;
  const cerrar = () => setAbierto(false);

  const manejarTeclaOpcion = (evento: React.KeyboardEvent<HTMLButtonElement>) => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      onCambiar(evento.currentTarget.dataset.valor ?? "");
      cerrar();
    } else if (evento.key === "Escape") {
      cerrar();
    }
  };

  return (
    <div ref={contenedorRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={ariaLabel}
        onClick={() => setAbierto((prev) => !prev)}
        onKeyDown={(evento) => {
          if (evento.key === "Escape" && abierto) cerrar();
        }}
        className={cn(CLASE_SELECT, "relative w-full", disabled && "cursor-not-allowed opacity-40")}
      >
        <span className={cn("block truncate", mostrarPlaceholder && "text-[var(--admin-texto-suave)]")}>
          {mostrarPlaceholder ? placeholder : seleccionada.etiqueta}
        </span>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-texto-suave)]"
        />
      </button>
      {abierto && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-1 shadow-2xl"
        >
          {opciones.map((opcion) => {
            const esSeleccionada = opcion.valor === valor;
            return (
              <button
                key={opcion.valor}
                type="button"
                role="option"
                aria-selected={esSeleccionada}
                data-valor={opcion.valor}
                onClick={() => {
                  onCambiar(opcion.valor);
                  cerrar();
                }}
                onKeyDown={manejarTeclaOpcion}
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-left text-sm transition",
                  esSeleccionada
                    ? "bg-[var(--admin-primario)] text-[var(--admin-primario-texto)]"
                    : "text-[var(--admin-texto)] hover:bg-[var(--admin-fondo-hover)]",
                )}
              >
                {opcion.etiqueta}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
