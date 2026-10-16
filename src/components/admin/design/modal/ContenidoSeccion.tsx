"use client";

import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";
import { LIMITES_TARJETA, type DatosTarjeta } from "./tipos";

interface ContenidoSeccionProps {
  title: string;
  subtitle: string;
  alCambiar: <K extends "title" | "subtitle">(
    campo: K,
    valor: DatosTarjeta[K]
  ) => void;
}

export default function ContenidoSeccion({
  title,
  subtitle,
  alCambiar,
}: ContenidoSeccionProps) {
  const excedeTitulo = title.length > LIMITES_TARJETA.title;
  const excedeSubtitulo = subtitle.length > LIMITES_TARJETA.subtitle;

  const claseInput =
    "w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] px-4 py-2.5 text-sm text-[var(--admin-texto)] outline-none transition-all duration-200 placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)] focus:ring-2 focus:ring-[var(--admin-primario)]/20";

  return (
    <div className="space-y-4">
      <h3
        className="text-xs font-black uppercase tracking-widest text-[var(--admin-texto-suave)]"
      >
        Contenido
      </h3>

      <div className="space-y-1">
        <label
          className="flex items-center justify-between gap-2 text-sm font-medium text-[var(--admin-texto)]"
        >
          Título
          <span
            className={cn("font-mono text-[var(--admin-texto-suave)]", excedeTitulo && "text-[var(--admin-peligro)]")}
          >
            {title.length}/{LIMITES_TARJETA.title}
          </span>
        </label>
        <input
          value={title}
          onChange={(e) => alCambiar("title", e.target.value)}
          placeholder="Título de la sección"
          className={cn(
            claseInput,
            excedeTitulo && "border-[var(--admin-peligro)] focus:border-[var(--admin-peligro)]"
          )}
        />
        {excedeTitulo && (
          <p className="text-xs text-[var(--admin-peligro)]">
            Excede el límite de {LIMITES_TARJETA.title} caracteres
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label
          className="flex items-center justify-between gap-2 text-sm font-medium text-[var(--admin-texto)]"
        >
          Subtítulo
          <span
            className={cn("font-mono text-[var(--admin-texto-suave)]", excedeSubtitulo && "text-[var(--admin-peligro)]")}
          >
            {subtitle.length}/{LIMITES_TARJETA.subtitle}
          </span>
        </label>
        <input
          value={subtitle}
          onChange={(e) => alCambiar("subtitle", e.target.value)}
          placeholder="Subtítulo opcional"
          className={cn(
            claseInput,
            excedeSubtitulo && "border-[var(--admin-peligro)] focus:border-[var(--admin-peligro)]"
          )}
        />
        {excedeSubtitulo && (
          <p className="text-xs text-[var(--admin-peligro)]">
            Excede el límite de {LIMITES_TARJETA.subtitle} caracteres
          </p>
        )}
      </div>
    </div>
  );
}
