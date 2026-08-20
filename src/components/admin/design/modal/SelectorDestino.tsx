"use client";

import type { DatosTarjeta, SelectorCategoria } from "./tipos";
import { OPCIONES_DESTINO } from "./tipos";

interface Props {
  linkType: DatosTarjeta["linkType"];
  linkValue: string;
  categorias: SelectorCategoria[];
  secondaryColor: string;
  textColor: string;
  alCambiar: <K extends "linkType" | "linkValue">(campo: K, valor: DatosTarjeta[K]) => void;
}

export default function SelectorDestino({
  linkType,
  linkValue,
  categorias,
  secondaryColor,
  textColor,
  alCambiar,
}: Props) {
  return (
    <div>
      <label className="text-xs font-black uppercase tracking-[0.2em] mb-2 block" style={{ color: textColor + "aa" }}>
        Destino del enlace
      </label>
      <select
        value={linkType}
        onChange={(e) => {
          alCambiar("linkType", e.target.value as DatosTarjeta["linkType"]);
          alCambiar("linkValue", "");
        }}
        className="w-full p-4 border rounded-xl bg-transparent cursor-pointer"
        style={{ backgroundColor: secondaryColor, color: textColor, borderColor: textColor + "44" }}
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
          className="w-full p-4 border rounded-xl bg-transparent cursor-pointer mt-2"
          style={{ backgroundColor: secondaryColor, color: textColor, borderColor: textColor + "44" }}
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

      {(linkType === "PAGE" || linkType === "EXTERNAL") && (
        <div className="mt-2">
          <input
            type="text"
            value={linkValue}
            onChange={(e) => alCambiar("linkValue", e.target.value)}
            placeholder={linkType === "EXTERNAL" ? "https://ejemplo.com" : "/mi-pagina"}
            className="w-full p-4 border rounded-xl bg-transparent"
            style={{ borderColor: textColor + "44", color: textColor }}
          />
          {linkType === "EXTERNAL" && (
            <p className="text-xs mt-1" style={{ color: textColor + "60" }}>
              Debe empezar con http:// o https://
            </p>
          )}
        </div>
      )}
    </div>
  );
}
