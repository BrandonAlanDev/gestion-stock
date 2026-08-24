"use client";

import { useRef } from "react";
import { Sparkles } from "lucide-react";
import { cn, getContrastColor } from "@/lib/utils";
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
  textColor: string;
}

interface MuestraColorProps {
  etiqueta: string;
  valor: string;
  campo: "buttonBgColor" | "buttonTextColor";
  fallback: string;
  ariaLabel: string;
  textColor: string;
  alCambiar: AparienciaSeccionProps["alCambiar"];
}

function MuestraColor({
  etiqueta,
  valor,
  campo,
  fallback,
  ariaLabel,
  textColor,
  alCambiar,
}: MuestraColorProps) {
  const refDelInput = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="text-xs font-medium" style={{ color: textColor + "80" }}>
        {etiqueta}
      </p>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => refDelInput.current?.click()}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = textColor + "08";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        className="mt-1.5 flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors duration-200 cursor-pointer"
        style={{ borderColor: textColor + "20", backgroundColor: "transparent" }}
      >
        <span
          className="h-6 w-6 shrink-0 rounded-full border"
          style={{
            borderColor: textColor + "30",
            backgroundColor: valor || fallback,
          }}
        />
        <span className="font-mono text-xs" style={{ color: textColor + "80" }}>
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
  textColor,
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
      textColor={textColor}
    >
      <div>
        <p
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: textColor + "99" }}
        >
          Subtítulo
        </p>
        <div className="mt-3 space-y-3">
          <InterruptorConDescripcion
            activo={subtitleNeon}
            etiqueta="Efecto neón"
            descripcion="Aplica un efecto luminoso al subtítulo"
            alCambiar={() => alCambiar("subtitleNeon", !subtitleNeon)}
            primaryColor={primaryColor}
            textColor={textColor}
          />
          <InterruptorConDescripcion
            activo={subtitleDim}
            etiqueta="Texto opaco"
            descripcion="Reduce el contraste del subtítulo"
            alCambiar={() => alCambiar("subtitleDim", !subtitleDim)}
            primaryColor={primaryColor}
            textColor={textColor}
          />
        </div>
      </div>

      <div>
        <p
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: textColor + "99" }}
        >
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
                onMouseEnter={(e) => {
                  if (!seleccionado) {
                    e.currentTarget.style.borderColor = textColor + "40";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!seleccionado) {
                    e.currentTarget.style.borderColor = textColor + "20";
                  }
                }}
                className="flex flex-col items-center gap-2 rounded-xl border-2 p-2.5 pt-3 transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: seleccionado ? primaryColor : textColor + "20",
                  backgroundColor: seleccionado ? primaryColor + "0D" : "transparent",
                }}
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
                <span
                  className="text-xs font-medium"
                  style={{ color: seleccionado ? primaryColor : textColor + "80" }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: textColor + "99" }}
        >
          Colores del botón
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <MuestraColor
            etiqueta="Fondo"
            valor={buttonBgColor}
            campo="buttonBgColor"
            fallback="#000000"
            ariaLabel="Color de fondo del botón"
            textColor={textColor}
            alCambiar={alCambiar}
          />
          <MuestraColor
            etiqueta="Texto"
            valor={buttonTextColor}
            campo="buttonTextColor"
            fallback="#ffffff"
            ariaLabel="Color del texto del botón"
            textColor={textColor}
            alCambiar={alCambiar}
          />
        </div>
      </div>
    </AcordeonSeccion>
  );
}
