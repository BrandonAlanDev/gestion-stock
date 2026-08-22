"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import LinkTypeSelector from "./LinkTypeSelector";
import type { SlideFormData } from "./SlideEditor";

interface InterruptorOpcionProps {
  activo: boolean;
  etiqueta: string;
  descripcion?: string;
  alCambiar: () => void;
  primaryColor: string;
  textColor: string;
}

function InterruptorOpcion({
  activo,
  etiqueta,
  descripcion,
  alCambiar,
  primaryColor,
  textColor,
}: InterruptorOpcionProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium" style={{ color: textColor + "CC" }}>
          {etiqueta}
        </p>
        {descripcion && (
          <p className="text-xs" style={{ color: textColor + "80" }}>
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
        className="relative h-7 w-14 shrink-0 rounded-full transition-colors cursor-pointer"
        style={{ backgroundColor: activo ? primaryColor : textColor + "40" }}
      >
        <div
          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform"
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
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
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
  primaryColor,
  secondaryColor,
  textColor,
}: OpcionesAvanzadasSlideProps) {
  return (
    <div
      className="overflow-hidden rounded-xl border transition-colors duration-200"
      style={{ borderColor: textColor + "20" }}
    >
      <button
        type="button"
        onClick={alAlternar}
        aria-expanded={abiertas}
        aria-controls="panel-opciones-avanzadas"
        className="flex w-full items-center justify-between px-4 py-3 cursor-pointer"
      >
        <span className="text-sm font-semibold" style={{ color: textColor + "CC" }}>
          Opciones avanzadas
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "transition-transform duration-200",
            abiertas && "rotate-180"
          )}
          style={{ color: textColor + "80" }}
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
              primaryColor={primaryColor}
              textColor={textColor}
              secondaryColor={secondaryColor}
            />

            <InterruptorOpcion
              activo={showText}
              etiqueta="Mostrar texto sobre la imagen"
              descripcion="El texto del slide se superpone sobre la imagen"
              alCambiar={alCambiarShowText}
              primaryColor={primaryColor}
              textColor={textColor}
            />

            <InterruptorOpcion
              activo={!hideButton}
              etiqueta="Mostrar botón"
              descripcion="El botón aparecerá sobre la imagen"
              alCambiar={alCambiarHideButton}
              primaryColor={primaryColor}
              textColor={textColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
