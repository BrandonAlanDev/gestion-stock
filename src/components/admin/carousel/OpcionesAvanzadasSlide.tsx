"use client";

import { ChevronDown } from "lucide-react";
import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";
import LinkTypeSelector from "./LinkTypeSelector";
import type { SlideFormData } from "./SlideEditor";

interface InterruptorOpcionProps {
  activo: boolean;
  etiqueta: string;
  descripcion?: string;
  alCambiar: () => void;
}

function InterruptorOpcion({
  activo,
  etiqueta,
  descripcion,
  alCambiar,
}: InterruptorOpcionProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-[var(--admin-texto)]">
          {etiqueta}
        </p>
        {descripcion && (
          <p className="text-xs text-[var(--admin-texto-suave)]">
            {descripcion}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={alCambiar}
        aria-label={etiqueta}
        role="switch"
        aria-checked={activo}
        className={`relative h-7 w-14 shrink-0 cursor-pointer rounded-full transition-colors ${activo ? "bg-[var(--admin-primario)]" : "bg-[var(--admin-borde)]"}`}
      >
        <div
          className="absolute top-1 h-5 w-5 rounded-full border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] shadow transition-transform"
          style={{ left: activo ? "calc(100% - 24px)" : "4px" }}
        />
      </button>
    </div>
  );
}

interface OpcionesAvanzadasSlideProps {
  abiertas: boolean;
  alAlternar: () => void;
  formData: SlideFormData;
  alCambiar: (campo: string, valor: unknown) => void;
  productos: { id: string; name: string }[];
  categorias: { id: string; name: string }[];
  showText: boolean;
  alCambiarShowText: () => void;
  hideButton: boolean;
  alCambiarHideButton: () => void;
}

export default function OpcionesAvanzadasSlide({
  abiertas,
  alAlternar,
  formData,
  alCambiar,
  productos,
  categorias,
  showText,
  alCambiarShowText,
  hideButton,
  alCambiarHideButton,
}: OpcionesAvanzadasSlideProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--admin-borde)] transition-colors duration-200">
      <button
        type="button"
        onClick={alAlternar}
        aria-expanded={abiertas}
        aria-controls="panel-opciones-avanzadas"
        className="flex w-full items-center justify-between px-4 py-3 cursor-pointer"
      >
        <span className="text-sm font-semibold text-[var(--admin-texto)]">
          Opciones avanzadas
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "text-[var(--admin-texto-suave)] transition-transform duration-200",
            abiertas && "rotate-180"
          )}
        />
      </button>

      <div
        id="panel-opciones-avanzadas"
        className={cn(
          "grid transition-all duration-200",
          abiertas ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 px-4 pb-4">
            <LinkTypeSelector
              linkType={formData.linkType}
              url={formData.url}
              onChange={alCambiar}
              products={productos}
              categories={categorias}
            />

            <InterruptorOpcion
              activo={showText}
              etiqueta="Mostrar texto sobre la imagen"
              descripcion="El texto del slide se superpone sobre la imagen"
              alCambiar={alCambiarShowText}
            />

            <InterruptorOpcion
              activo={!hideButton}
              etiqueta="Mostrar botón"
              descripcion="El botón aparecerá sobre la imagen"
              alCambiar={alCambiarHideButton}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
