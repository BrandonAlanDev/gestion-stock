"use client";

import { useRef } from "react";
import { Sparkles } from "lucide-react";
import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";
import { obtenerColorContraste as getContrastColor } from "@/lib/utilidades/obtener-color-contraste";
import AcordeonSeccion from "./AcordeonSeccion";
import InterruptorConDescripcion from "./InterruptorConDescripcion";
import { OPCIONES_BOTON, type DatosTarjeta } from "./tipos";

interface AparienciaSeccionProps {
  abierta: boolean;
  alAlternar: () => void;
  subtitleNeon: boolean;
  subtitleDim: boolean;
  buttonVariant: DatosTarjeta["buttonVariant"];
  buttonBgColor: string;
  buttonTextColor: string;
  alCambiar: <
    K extends
      | "subtitleNeon"
      | "subtitleDim"
      | "buttonVariant"
      | "buttonBgColor"
      | "buttonTextColor"
  >(
    campo: K,
    valor: DatosTarjeta[K]
  ) => void;
  primaryColor: string;
}

interface MuestraColorProps {
  etiqueta: string;
  valor: string;
  campo: "buttonBgColor" | "buttonTextColor";
  fallback: string;
  ariaLabel: string;
  alCambiar: AparienciaSeccionProps["alCambiar"];
}

function MuestraColor({
  etiqueta,
  valor,
  campo,
  fallback,
  ariaLabel,
  alCambiar,
}: MuestraColorProps) {
  const refDelInput = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="text-xs font-medium text-[var(--admin-texto-suave)]">
        {etiqueta}
      </p>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => refDelInput.current?.click()}
        className="mt-1.5 flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] px-3 py-2 transition-colors duration-200 hover:bg-[var(--admin-fondo-hover)]"
      >
        <span
          className="h-6 w-6 shrink-0 rounded-full border border-[var(--admin-borde)]"
          style={{
            backgroundColor: valor || fallback,
          }}
        />
        <span className="font-mono text-xs text-[var(--admin-texto-suave)]">
          {valor || fallback}
        </span>
      </button>
      <input
        type="color"
        value={valor || fallback}
        onChange={(e) => alCambiar(campo, e.target.value)}
        className="sr-only"
        ref={refDelInput}
      />
    </div>
  );
}

export default function AparienciaSeccion({
  abierta,
  alAlternar,
  subtitleNeon,
  subtitleDim,
  buttonVariant,
  buttonBgColor,
  buttonTextColor,
  alCambiar,
  primaryColor,
}: AparienciaSeccionProps) {
  const bgBoton = buttonBgColor || primaryColor;
  const colorBoton = buttonTextColor || getContrastColor(bgBoton);

  return (
    <AcordeonSeccion
      abierto={abierta}
      alAlternar={alAlternar}
      titulo="Apariencia"
      icono={Sparkles}
      id="panel-apariencia"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--admin-texto-suave)]">
          Subtítulo
        </p>
        <div className="mt-3 space-y-3">
          <InterruptorConDescripcion
            activo={subtitleNeon}
            etiqueta="Efecto neón"
            descripcion="Aplica un efecto luminoso al subtítulo"
            alCambiar={() => alCambiar("subtitleNeon", !subtitleNeon)}
          />
          <InterruptorConDescripcion
            activo={subtitleDim}
            etiqueta="Texto opaco"
            descripcion="Reduce el contraste del subtítulo"
            alCambiar={() => alCambiar("subtitleDim", !subtitleDim)}
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--admin-texto-suave)]">
          Estilo del botón
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {OPCIONES_BOTON.map((opt) => {
            const seleccionado = buttonVariant === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={seleccionado}
                onClick={() =>
                  alCambiar("buttonVariant", opt.value as DatosTarjeta["buttonVariant"])
                }
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-2.5 pt-3 transition-all duration-200",
                  seleccionado
                    ? "border-[var(--admin-primario)] bg-[var(--admin-fondo-hover)]"
                    : "border-[var(--admin-borde)] hover:border-[var(--admin-primario)]"
                )}
              >
                <span
                  className={cn(
                    "px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                    opt.value === "DEFAULT" && "rounded-lg",
                    opt.value === "STRAIGHT" && "rounded-none",
                    opt.value === "TRANSPARENT" &&
                      "rounded-lg border-2 bg-transparent"
                  )}
                  style={
                    opt.value === "TRANSPARENT"
                      ? {
                          color: colorBoton,
                          borderColor: bgBoton,
                          backgroundColor: "transparent",
                        }
                      : { backgroundColor: bgBoton, color: colorBoton }
                  }
                >
                  Ver más
                </span>
                <span className={cn("text-xs font-medium", seleccionado ? "text-[var(--admin-primario)]" : "text-[var(--admin-texto-suave)]")}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--admin-texto-suave)]">
          Colores del botón
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <MuestraColor
            etiqueta="Fondo"
            valor={buttonBgColor}
            campo="buttonBgColor"
            fallback="#000000"
            ariaLabel="Color de fondo del botón"
            alCambiar={alCambiar}
          />
          <MuestraColor
            etiqueta="Texto"
            valor={buttonTextColor}
            campo="buttonTextColor"
            fallback="#ffffff"
            ariaLabel="Color del texto del botón"
            alCambiar={alCambiar}
          />
        </div>
      </div>
    </AcordeonSeccion>
  );
}
