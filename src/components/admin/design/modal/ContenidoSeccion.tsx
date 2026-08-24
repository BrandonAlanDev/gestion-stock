"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { LIMITES_TARJETA, type DatosTarjeta } from "./tipos";

interface ContenidoSeccionProps {
  title: string;
  subtitle: string;
  alCambiar: <K extends "title" | "subtitle">(
    campo: K,
    valor: DatosTarjeta[K]
  ) => void;
  primaryColor: string;
  textColor: string;
}

export default function ContenidoSeccion({
  title,
  subtitle,
  alCambiar,
  primaryColor,
  textColor,
}: ContenidoSeccionProps) {
  const excedeTitulo = title.length > LIMITES_TARJETA.title;
  const excedeSubtitulo = subtitle.length > LIMITES_TARJETA.subtitle;

  const estiloInput = {
    "--input-fondo": textColor + "08",
    "--input-borde": textColor + "30",
    "--input-texto": textColor,
    "--input-placeholder": textColor + "80",
    "--input-foco": primaryColor,
  } as CSSProperties;

  const claseInput =
    "w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-200 bg-[var(--input-fondo)] border-[var(--input-borde)] text-[var(--input-texto)] placeholder:text-[var(--input-placeholder)] focus:border-[var(--input-foco)] focus:ring-2 ring-[var(--input-foco)]/20";

  return (
    <div className="space-y-4">
      <h3
        className="text-xs font-black uppercase tracking-widest"
        style={{ color: textColor + "99" }}
      >
        Contenido
      </h3>

      <div className="space-y-1">
        <label
          className="flex items-center justify-between gap-2 text-sm font-medium"
          style={{ color: textColor + "CC" }}
        >
          Título
          <span
            className={cn("font-mono", excedeTitulo ? "text-red-400" : "")}
            style={{ color: textColor + "80" }}
          >
            {title.length}/{LIMITES_TARJETA.title}
          </span>
        </label>
        <input
          value={title}
          onChange={(e) => alCambiar("title", e.target.value)}
          placeholder="Título de la sección"
          style={estiloInput}
          className={cn(
            claseInput,
            excedeTitulo && "border-red-500/50 focus:border-red-500"
          )}
        />
        {excedeTitulo && (
          <p className="text-xs text-red-400">
            Excede el límite de {LIMITES_TARJETA.title} caracteres
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label
          className="flex items-center justify-between gap-2 text-sm font-medium"
          style={{ color: textColor + "CC" }}
        >
          Subtítulo
          <span
            className={cn("font-mono", excedeSubtitulo ? "text-red-400" : "")}
            style={{ color: textColor + "80" }}
          >
            {subtitle.length}/{LIMITES_TARJETA.subtitle}
          </span>
        </label>
        <input
          value={subtitle}
          onChange={(e) => alCambiar("subtitle", e.target.value)}
          placeholder="Subtítulo opcional"
          style={estiloInput}
          className={cn(
            claseInput,
            excedeSubtitulo && "border-red-500/50 focus:border-red-500"
          )}
        />
        {excedeSubtitulo && (
          <p className="text-xs text-red-400">
            Excede el límite de {LIMITES_TARJETA.subtitle} caracteres
          </p>
        )}
      </div>
    </div>
  );
}
