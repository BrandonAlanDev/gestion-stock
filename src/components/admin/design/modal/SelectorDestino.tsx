"use client";

import type { DatosTarjeta, SelectorCategoria, SelectorProducto } from "./tipos";
import { OPCIONES_DESTINO } from "./tipos";

interface Props {
  linkType: DatosTarjeta["linkType"];
  linkValue: string;
  categorias: SelectorCategoria[];
  productos: SelectorProducto[];
  alCambiar: <K extends "linkType" | "linkValue">(campo: K, valor: DatosTarjeta[K]) => void;
}

export default function SelectorDestino({
  linkType,
  linkValue,
  categorias,
  productos,
  alCambiar,
}: Props) {
  const claseSelect = "mt-2 w-full cursor-pointer rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] px-4 py-2.5 text-sm text-[var(--admin-texto)] outline-none transition-all duration-200 focus:border-[var(--admin-primario)] focus:ring-2 focus:ring-[var(--admin-primario)]/20";
  const claseOpcion = "bg-[var(--admin-fondo-opaco)] text-[var(--admin-texto)]";
  const claseInput = "w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] px-4 py-2.5 text-sm text-[var(--admin-texto)] outline-none transition-all duration-200 placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)] focus:ring-2 focus:ring-[var(--admin-primario)]/20";

  return (
    <div>
      <p
        className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--admin-texto-suave)]"
      >
        Destino del enlace
      </p>

      <select
        value={linkType}
        onChange={(e) => {
          alCambiar("linkType", e.target.value as DatosTarjeta["linkType"]);
          alCambiar("linkValue", "");
        }}
        className={claseSelect}
      >
        {OPCIONES_DESTINO.map((opt) => (
          <option key={opt.value} value={opt.value} className={claseOpcion}>
            {opt.label}
          </option>
        ))}
      </select>

      {linkType === "CATEGORY" && (
        <select
          value={linkValue}
          onChange={(e) => alCambiar("linkValue", e.target.value)}
          className={claseSelect}
        >
          <option value="" className={claseOpcion}>
            Seleccionar categoría...
          </option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id} className={claseOpcion}>
              {cat.label}
            </option>
          ))}
        </select>
      )}

      {linkType === "PRODUCT" && (
        <select
          value={linkValue}
          onChange={(e) => alCambiar("linkValue", e.target.value)}
          className={claseSelect}
        >
          <option value="" className={claseOpcion}>
            Seleccionar producto...
          </option>
          {productos.map((prod) => (
            <option key={prod.id} value={prod.id} className={claseOpcion}>
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
            className={claseInput}
          />
          <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
            Debe empezar con http:// o https://
          </p>
        </div>
      )}
    </div>
  );
}
