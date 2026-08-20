"use client";

import type { DatosTarjeta } from "./tipos";
import { OPCIONES_ENLACE, OPCIONES_BOTON } from "./tipos";

interface Props {
  linkStyle: DatosTarjeta["linkStyle"];
  buttonVariant: DatosTarjeta["buttonVariant"];
  buttonText: string;
  buttonBgColor: string;
  buttonTextColor: string;
  primaryColor: string;
  textColor: string;
  alCambiar: <K extends "linkStyle" | "buttonVariant" | "buttonText" | "buttonBgColor" | "buttonTextColor">(
    campo: K,
    valor: DatosTarjeta[K]
  ) => void;
}

function Etiqueta({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <label className="text-xs font-black uppercase tracking-[0.2em] mb-2 block" style={{ color }}>
      {children}
    </label>
  );
}

function BotonSegmentado({
  opciones,
  valor,
  alCambiar,
  colorPrimario,
  colorTexto,
}: {
  opciones: { value: string; label: string }[];
  valor: string;
  alCambiar: (valor: string) => void;
  colorPrimario: string;
  colorTexto: string;
}) {
  return (
    <div className="flex gap-2">
      {opciones.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => alCambiar(opt.value)}
          className="flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer"
          style={{
            borderColor: valor === opt.value ? colorPrimario : colorTexto + "22",
            backgroundColor: valor === opt.value ? colorPrimario + "15" : "transparent",
            color: valor === opt.value ? colorPrimario : colorTexto,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function ControlesEnlace({
  linkStyle,
  buttonVariant,
  buttonText,
  buttonBgColor,
  buttonTextColor,
  primaryColor,
  textColor,
  alCambiar,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Etiqueta color={textColor + "aa"}>Click en</Etiqueta>
        <BotonSegmentado
          opciones={OPCIONES_ENLACE}
          valor={linkStyle}
          alCambiar={(valor) => alCambiar("linkStyle", valor as DatosTarjeta["linkStyle"])}
          colorPrimario={primaryColor}
          colorTexto={textColor}
        />
      </div>

      {linkStyle === "BUTTON" && (
        <div className="space-y-4">
          <div>
            <Etiqueta color={textColor + "aa"}>Estilo del botón</Etiqueta>
            <BotonSegmentado
              opciones={OPCIONES_BOTON}
              valor={buttonVariant}
              alCambiar={(valor) => alCambiar("buttonVariant", valor as DatosTarjeta["buttonVariant"])}
              colorPrimario={primaryColor}
              colorTexto={textColor}
            />
          </div>
          <div className="space-y-1">
            <Etiqueta color={textColor + "aa"}>Texto del botón</Etiqueta>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => alCambiar("buttonText", e.target.value)}
              placeholder="Ej: Ver más"
              className="w-full p-4 border rounded-xl bg-transparent"
              style={{ borderColor: textColor + "44", color: textColor }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Etiqueta color={textColor + "aa"}>Color de fondo</Etiqueta>
              <input
                type="color"
                value={buttonBgColor || "#000000"}
                onChange={(e) => alCambiar("buttonBgColor", e.target.value)}
                className="w-full h-14 rounded-2xl cursor-pointer"
              />
            </div>
            <div>
              <Etiqueta color={textColor + "aa"}>Color del texto</Etiqueta>
              <input
                type="color"
                value={buttonTextColor || "#ffffff"}
                onChange={(e) => alCambiar("buttonTextColor", e.target.value)}
                className="w-full h-14 rounded-2xl cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
