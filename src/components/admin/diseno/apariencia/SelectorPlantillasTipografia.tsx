"use client";

import { Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { respaldoFuente } from "@/components/apariencia/fuentes";
import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";

import {
  CATEGORIAS_TIPOGRAFIA,
  PLANTILLAS_TIPOGRAFIA,
  type CategoriaTipografia,
  type PlantillaTipografia,
} from "./plantillas-tipografia";

const FUENTES_BASE = new Set(["Outfit", "Playfair Display"]);

interface SelectorPlantillasTipografiaProps {
  principal: string;
  secundaria: string;
  alSeleccionar: (plantilla: PlantillaTipografia) => void;
}

export default function SelectorPlantillasTipografia({
  principal,
  secundaria,
  alSeleccionar,
}: SelectorPlantillasTipografiaProps) {
  const [categoria, setCategoria] = useState<CategoriaTipografia | "Todas">("Todas");
  const contenedorRef = useRef<HTMLDivElement>(null);
  const enlacesRef = useRef<Map<string, HTMLLinkElement>>(new Map());
  const plantillasVisibles = useMemo(
    () =>
      categoria === "Todas"
        ? PLANTILLAS_TIPOGRAFIA
        : PLANTILLAS_TIPOGRAFIA.filter(
          (plantilla) => plantilla.categoria === categoria,
        ),
    [categoria],
  );

  useEffect(() => {
    const enlaces = enlacesRef.current;
    return () => {
      for (const enlace of enlaces.values()) enlace.remove();
      enlaces.clear();
    };
  }, []);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;

    const cargarFuente = (fuente: string) => {
      if (FUENTES_BASE.has(fuente) || enlacesRef.current.has(fuente)) return;
      const enlace = document.createElement("link");
      enlace.rel = "stylesheet";
      enlace.href = `https://fonts.googleapis.com/css2?family=${fuente.replaceAll(" ", "+")}:wght@400;700&display=swap`;
      document.head.appendChild(enlace);
      enlacesRef.current.set(fuente, enlace);
    };
    const tarjetas = contenedor.querySelectorAll<HTMLButtonElement>("[data-indice]");
    const cargarTarjeta = (tarjeta: HTMLButtonElement) => {
      const plantilla = plantillasVisibles[Number(tarjeta.dataset.indice)];
      if (!plantilla) return;
      cargarFuente(plantilla.principal);
      cargarFuente(plantilla.secundaria);
    };

    if (!("IntersectionObserver" in window)) {
      tarjetas.forEach(cargarTarjeta);
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          cargarTarjeta(entrada.target as HTMLButtonElement);
          observador.unobserve(entrada.target);
        }
      },
      { root: contenedor, rootMargin: "80px" },
    );
    tarjetas.forEach((tarjeta) => observador.observe(tarjeta));
    return () => observador.disconnect();
  }, [categoria, plantillasVisibles]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar combinaciones">
        {(["Todas", ...CATEGORIAS_TIPOGRAFIA] as const).map((opcion) => (
          <button
            key={opcion}
            type="button"
            aria-pressed={categoria === opcion}
            onClick={() => {
              setCategoria(opcion);
              if (contenedorRef.current) contenedorRef.current.scrollTop = 0;
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-primario)]",
              categoria === opcion
                ? "border-[var(--admin-primario)] bg-[var(--admin-primario-suave)] text-[var(--admin-primario)]"
                : "border-[var(--admin-borde)] text-[var(--admin-texto-suave)] hover:text-[var(--admin-texto)]",
            )}
          >
            {opcion}
          </button>
        ))}
      </div>
      <div
        ref={contenedorRef}
        role="radiogroup"
        aria-label="Combinaciones de tipografía"
        className="max-h-[420px] overflow-y-auto overscroll-contain rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)]/40 p-3"
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3">
          {plantillasVisibles.map((plantilla, indice) => {
            const seleccionada =
              plantilla.principal === principal &&
              plantilla.secundaria === secundaria;

            return (
              <button
                key={plantilla.id}
                data-indice={indice}
                type="button"
                role="radio"
                aria-checked={seleccionada}
                onClick={() => alSeleccionar(plantilla)}
                className={cn(
                  "group relative flex flex-col gap-3 rounded-xl border p-3 text-left transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-primario)]",
                  seleccionada
                    ? "border-[var(--admin-primario)] bg-[var(--admin-primario-suave)]/40 ring-1 ring-[var(--admin-primario)]/40"
                    : "border-[var(--admin-borde)] bg-[var(--admin-fondo)] hover:-translate-y-0.5 hover:border-[var(--admin-primario)] hover:shadow-lg hover:shadow-black/20",
                )}
              >
                {seleccionada && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--admin-primario)] text-[var(--admin-primario-texto)]">
                    <Check size={12} />
                    <span className="sr-only">Seleccionada</span>
                  </span>
                )}
                <span className="pr-6 text-sm font-semibold text-[var(--admin-texto)]">
                  {plantilla.nombre}
                </span>
                <span className="block w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-3 text-[var(--admin-texto)]">
                  <span
                    className="block text-xl font-bold leading-tight"
                    style={{
                      fontFamily: `'${plantilla.secundaria}', ${respaldoFuente(plantilla.secundaria)}`,
                    }}
                  >
                    Tu próxima gran idea
                  </span>
                  <span
                    className="mt-2 block text-xs leading-relaxed"
                    style={{ fontFamily: `'${plantilla.principal}', ${respaldoFuente(plantilla.principal)}` }}
                  >
                    Descubrí productos para cada momento.
                  </span>
                </span>
                <span className="text-xs leading-snug text-[var(--admin-texto-suave)]">
                  {plantilla.descripcion}
                </span>
                <span className="text-[11px] text-[var(--admin-texto-suave)]">
                  {plantilla.secundaria} + {plantilla.principal}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
