"use client";

import { Link2, Image as IconoImagen, MousePointerClick } from "lucide-react";
import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";
import AcordeonSeccion from "./AcordeonSeccion";
import SelectorDestino from "./SelectorDestino";
import {
  LIMITES_TARJETA,
  OPCIONES_ENLACE,
  type DatosTarjeta,
  type SelectorCategoria,
  type SelectorProducto,
} from "./tipos";

interface BotonEnlaceSeccionProps {
  abierta: boolean;
  alAlternar: () => void;
  linkStyle: DatosTarjeta["linkStyle"];
  buttonText: string;
  linkType: DatosTarjeta["linkType"];
  linkValue: string;
  categorias: SelectorCategoria[];
  productos: SelectorProducto[];
  alCambiar: <K extends "linkStyle" | "buttonText" | "linkType" | "linkValue">(
    campo: K,
    valor: DatosTarjeta[K]
  ) => void;
}

export default function BotonEnlaceSeccion({
  abierta,
  alAlternar,
  linkStyle,
  buttonText,
  linkType,
  linkValue,
  categorias,
  productos,
  alCambiar,
}: BotonEnlaceSeccionProps) {
  const excedeLimite = buttonText.length > LIMITES_TARJETA.boton;

  return (
    <AcordeonSeccion
      abierto={abierta}
      alAlternar={alAlternar}
      titulo="Botón y enlace"
      icono={Link2}
      id="panel-boton-enlace"
    >
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--admin-texto-suave)]">
          Click en
        </p>
        <p className="text-xs text-[var(--admin-texto-suave)]">
          ¿Qué elemento abre el enlace?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {OPCIONES_ENLACE.map((opt) => {
            const seleccionada = linkStyle === opt.value;
            const Icono = opt.value === "IMAGE" ? IconoImagen : MousePointerClick;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={seleccionada}
                onClick={() => alCambiar("linkStyle", opt.value as DatosTarjeta["linkStyle"])}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
                  seleccionada
                    ? "border-[var(--admin-primario)] bg-[var(--admin-fondo-hover)] text-[var(--admin-primario)]"
                    : "border-[var(--admin-borde)] text-[var(--admin-texto-suave)] hover:border-[var(--admin-primario)]"
                )}
              >
                <Icono size={22} />
                <span className="text-sm font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1">
        <label
          className="flex items-center justify-between gap-2 text-sm font-medium text-[var(--admin-texto)]"
        >
          <span>Texto del botón</span>
          <span
            className={cn("font-mono text-xs text-[var(--admin-texto-suave)]", excedeLimite && "text-[var(--admin-peligro)]")}
          >
            {buttonText.length}/{LIMITES_TARJETA.boton}
          </span>
        </label>
        <input
          type="text"
          value={buttonText}
          onChange={(e) => alCambiar("buttonText", e.target.value)}
          placeholder="Ej: Ver más"
          className={cn(
            "w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] px-4 py-2.5 text-sm text-[var(--admin-texto)] outline-none transition-all duration-200 placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)] focus:ring-2 focus:ring-[var(--admin-primario)]/20",
            excedeLimite && "border-[var(--admin-peligro)] focus:border-[var(--admin-peligro)]"
          )}
        />
        {excedeLimite && (
          <p className="text-xs text-[var(--admin-peligro)]">
            Excede el límite de {LIMITES_TARJETA.boton} caracteres
          </p>
        )}
      </div>

      <SelectorDestino
        linkType={linkType}
        linkValue={linkValue}
        categorias={categorias}
        productos={productos}
        alCambiar={alCambiar}
      />
    </AcordeonSeccion>
  );
}
