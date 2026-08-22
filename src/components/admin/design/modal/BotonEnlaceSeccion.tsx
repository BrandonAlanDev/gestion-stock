"use client";

import { useState, type CSSProperties } from "react";
import { Link2, Image as IconoImagen, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
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
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
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
  primaryColor,
  secondaryColor,
  textColor,
}: BotonEnlaceSeccionProps) {
  const [opcionEnHover, setOpcionEnHover] = useState<string | null>(null);
  const excedeLimite = buttonText.length > LIMITES_TARJETA.boton;

  const estiloInput = {
    "--input-fondo": textColor + "08",
    "--input-borde": textColor + "30",
    "--input-texto": textColor,
    "--input-placeholder": textColor + "80",
    "--input-foco": primaryColor,
  } as CSSProperties;

  return (
    <AcordeonSeccion
      abierto={abierta}
      alAlternar={alAlternar}
      titulo="Botón y enlace"
      icono={Link2}
      id="panel-boton-enlace"
      textColor={textColor}
    >
      <div className="space-y-3">
        <p
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: textColor + "99" }}
        >
          Click en
        </p>
        <p className="text-xs" style={{ color: textColor + "80" }}>
          ¿Qué elemento abre el enlace?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {OPCIONES_ENLACE.map((opt) => {
            const seleccionada = linkStyle === opt.value;
            const enHover = opcionEnHover === opt.value;
            const Icono = opt.value === "IMAGE" ? IconoImagen : MousePointerClick;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={seleccionada}
                onClick={() => alCambiar("linkStyle", opt.value as DatosTarjeta["linkStyle"])}
                onMouseEnter={() => setOpcionEnHover(opt.value)}
                onMouseLeave={() => setOpcionEnHover(null)}
                className="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer"
                style={
                  seleccionada
                    ? {
                        borderColor: primaryColor,
                        backgroundColor: primaryColor + "0D",
                        color: primaryColor,
                      }
                    : {
                        borderColor: enHover ? textColor + "40" : textColor + "20",
                        color: textColor + "80",
                      }
                }
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
          className="flex items-center justify-between gap-2 text-sm font-medium"
          style={{ color: textColor + "CC" }}
        >
          <span>Texto del botón</span>
          <span
            className={cn("font-mono text-xs", excedeLimite && "text-red-400")}
            style={excedeLimite ? undefined : { color: textColor + "80" }}
          >
            {buttonText.length}/{LIMITES_TARJETA.boton}
          </span>
        </label>
        <input
          type="text"
          value={buttonText}
          onChange={(e) => alCambiar("buttonText", e.target.value)}
          placeholder="Ej: Ver más"
          style={estiloInput}
          className={cn(
            "w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-200 bg-[var(--input-fondo)] border-[var(--input-borde)] text-[var(--input-texto)] placeholder:text-[var(--input-placeholder)] focus:border-[var(--input-foco)] focus:ring-2 ring-[var(--input-foco)]/20",
            excedeLimite && "border-red-500/50 focus:border-red-500"
          )}
        />
        {excedeLimite && (
          <p className="text-xs text-red-400">
            Excede el límite de {LIMITES_TARJETA.boton} caracteres
          </p>
        )}
      </div>

      <SelectorDestino
        linkType={linkType}
        linkValue={linkValue}
        categorias={categorias}
        productos={productos}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        textColor={textColor}
        alCambiar={alCambiar}
      />
    </AcordeonSeccion>
  );
}
