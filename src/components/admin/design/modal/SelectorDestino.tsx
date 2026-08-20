"use client";

import type { CSSProperties } from "react";
import type { DatosTarjeta, SelectorCategoria, SelectorProducto } from "./tipos";
import { OPCIONES_DESTINO } from "./tipos";

interface Props {
  linkType: DatosTarjeta["linkType"];
  linkValue: string;
  categorias: SelectorCategoria[];
  productos: SelectorProducto[];
  primaryColor?: string;
  secondaryColor: string;
  textColor: string;
  alCambiar: <K extends "linkType" | "linkValue">(campo: K, valor: DatosTarjeta[K]) => void;
}

export default function SelectorDestino({
  linkType,
  linkValue,
  categorias,
  productos,
  primaryColor = "#06b6d4",
  secondaryColor,
  textColor,
  alCambiar,
}: Props) {
  const estiloSelect = {
    backgroundColor: secondaryColor,
    border: "1px solid " + textColor + "30",
    color: textColor,
  };

  const manejarFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = primaryColor;
    e.currentTarget.style.boxShadow = `0 0 0 2px ${primaryColor}33`;
  };

  const manejarBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = textColor + "30";
    e.currentTarget.style.boxShadow = "none";
  };

  const estiloInput = {
    "--input-fondo": textColor + "08",
    "--input-borde": textColor + "30",
    "--input-texto": textColor,
    "--input-placeholder": textColor + "80",
    "--input-foco": primaryColor,
  } as CSSProperties;

  return (
    <div>
      <p
        className="text-xs font-bold uppercase tracking-[0.2em]"
        style={{ color: textColor + "99" }}
      >
        Destino del enlace
      </p>

      <select
        value={linkType}
        onChange={(e) => {
          alCambiar("linkType", e.target.value as DatosTarjeta["linkType"]);
          alCambiar("linkValue", "");
        }}
        onFocus={manejarFocus}
        onBlur={manejarBlur}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 cursor-pointer mt-2"
        style={estiloSelect}
      >
        {OPCIONES_DESTINO.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ backgroundColor: secondaryColor, color: textColor }}>
            {opt.label}
          </option>
        ))}
      </select>

      {linkType === "CATEGORY" && (
        <select
          value={linkValue}
          onChange={(e) => alCambiar("linkValue", e.target.value)}
          onFocus={manejarFocus}
          onBlur={manejarBlur}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 cursor-pointer mt-2"
          style={estiloSelect}
        >
          <option value="" style={{ backgroundColor: secondaryColor, color: textColor }}>
            Seleccionar categoría...
          </option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id} style={{ backgroundColor: secondaryColor, color: textColor }}>
              {cat.label}
            </option>
          ))}
        </select>
      )}

      {linkType === "PRODUCT" && (
        <select
          value={linkValue}
          onChange={(e) => alCambiar("linkValue", e.target.value)}
          onFocus={manejarFocus}
          onBlur={manejarBlur}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 cursor-pointer mt-2"
          style={estiloSelect}
        >
          <option value="" style={{ backgroundColor: secondaryColor, color: textColor }}>
            Seleccionar producto...
          </option>
          {productos.map((prod) => (
            <option key={prod.id} value={prod.id} style={{ backgroundColor: secondaryColor, color: textColor }}>
              {prod.label}
            </option>
          ))}
        </select>
      )}

      {linkType === "EXTERNAL" && (
        <div className="mt-2">
          <input
            type="text"
            value={linkValue}
            onChange={(e) => alCambiar("linkValue", e.target.value)}
            placeholder="https://ejemplo.com"
            style={estiloInput}
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-200 bg-[var(--input-fondo)] border-[var(--input-borde)] text-[var(--input-texto)] placeholder:text-[var(--input-placeholder)] focus:border-[var(--input-foco)] focus:ring-2 ring-[var(--input-foco)]/20"
          />
          <p className="text-xs mt-1" style={{ color: textColor + "60" }}>
            Debe empezar con http:// o https://
          </p>
        </div>
      )}
    </div>
  );
}
