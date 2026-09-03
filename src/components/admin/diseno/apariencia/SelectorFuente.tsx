"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { FUENTES_DISPONIBLES } from "@/components/apariencia/fuentes";

const MAX_OPCIONES_VISIBLES = 9;
const ALTURA_OPCION = 36;
const MARGEN_SEGURIDAD = 8;

interface SelectorFuenteProps {
  id: string;
  etiqueta: string;
  valor: string;
  alCambiar: (valor: string) => void;
}

export default function SelectorFuente({
  id,
  etiqueta,
  valor,
  alCambiar,
}: SelectorFuenteProps) {
  const [abierto, setAbierto] = useState(false);
  const [haciaArriba, setHaciaArriba] = useState(false);
  const [alturaMaxima, setAlturaMaxima] = useState(
    MAX_OPCIONES_VISIBLES * ALTURA_OPCION,
  );
  const contenedorRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);

  const opcionSeleccionada =
    FUENTES_DISPONIBLES.find((fuente) => fuente.valor === valor) ?? null;

  const calcularPosicion = () => {
    const boton = botonRef.current;
    if (!boton) return;

    const rect = boton.getBoundingClientRect();
    const altoDeseado = MAX_OPCIONES_VISIBLES * ALTURA_OPCION;
    const espacioAbajo = window.innerHeight - rect.bottom - MARGEN_SEGURIDAD;
    const espacioArriba = rect.top - MARGEN_SEGURIDAD;
    const minimoUtil = 3 * ALTURA_OPCION;

    if (espacioAbajo >= minimoUtil) {
      setHaciaArriba(false);
      setAlturaMaxima(Math.max(minimoUtil, Math.min(altoDeseado, espacioAbajo)));
    } else {
      setHaciaArriba(true);
      setAlturaMaxima(
        Math.max(minimoUtil, Math.min(altoDeseado, espacioArriba)),
      );
    }
  };

  const alternar = () => {
    if (!abierto) calcularPosicion();
    setAbierto((actual) => !actual);
  };

  useEffect(() => {
    const clicFuera = (evento: MouseEvent) => {
      if (!contenedorRef.current?.contains(evento.target as Node)) {
        setAbierto(false);
      }
    };
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };

    document.addEventListener("mousedown", clicFuera);
    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener("mousedown", clicFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, []);

  return (
    <div ref={contenedorRef} className="relative">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-[var(--admin-texto)]"
      >
        {etiqueta}
      </label>

      <button
        ref={botonRef}
        id={id}
        type="button"
        onClick={alternar}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-3 py-2 text-sm text-[var(--admin-texto)] focus:border-[var(--admin-primario)] focus:outline-none"
      >
        <span
          className="truncate"
          style={{ fontFamily: `'${valor}', sans-serif` }}
        >
          {opcionSeleccionada?.etiqueta ?? valor}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[var(--admin-texto-suave)] transition-transform ${
            abierto ? "rotate-180" : ""
          }`}
        />
      </button>

      {abierto && (
        <div
          role="listbox"
          className={`absolute left-0 z-50 w-full overflow-hidden rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] shadow-xl ${
            haciaArriba ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${alturaMaxima}px` }}
          >
            {FUENTES_DISPONIBLES.map((fuente) => (
              <button
                key={fuente.valor}
                type="button"
                role="option"
                aria-selected={fuente.valor === valor}
                onClick={() => {
                  alCambiar(fuente.valor);
                  setAbierto(false);
                }}
                className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-[var(--admin-fondo-suave)] ${
                  fuente.valor === valor
                    ? "text-[var(--admin-primario)]"
                    : "text-[var(--admin-texto)]"
                }`}
                style={{ fontFamily: `'${fuente.valor}', sans-serif` }}
              >
                {fuente.etiqueta}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
