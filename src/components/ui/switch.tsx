"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  activo: boolean;
  alCambiar: (valor: boolean) => void;
  etiqueta?: string;
  descripcion?: string;
  deshabilitado?: boolean;
  mostrarEstado?: boolean;
}

export default function Switch({
  activo,
  alCambiar,
  etiqueta,
  descripcion,
  deshabilitado,
  mostrarEstado,
}: SwitchProps) {
  const conTexto = Boolean(etiqueta || descripcion);

  const toggle = (
    <span
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full border border-[var(--admin-borde)] transition-colors",
        activo ? "border-transparent bg-[var(--admin-primario)]" : "bg-[var(--admin-fondo-hover)]",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform",
          activo ? "translate-x-5" : "translate-x-0",
        )}
      />
    </span>
  );

  const estado = (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        activo
          ? "bg-[var(--admin-primario-suave)] text-[var(--admin-primario)]"
          : "text-[var(--admin-texto-suave)]",
      )}
    >
      {activo ? "Activo" : "Inactivo"}
    </span>
  );

  const ladoDerecho = mostrarEstado ? (
    <span className="flex shrink-0 items-center gap-2">
      {estado}
      {toggle}
    </span>
  ) : (
    toggle
  );

  const clasesBase = cn(
    deshabilitado && "pointer-events-none opacity-50",
    conTexto && "flex w-full items-center justify-between gap-4 py-3",
    !conTexto && "inline-flex items-center",
  );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      disabled={deshabilitado}
      onClick={() => alCambiar(!activo)}
      className={cn(clasesBase, "cursor-pointer")}
    >
      {conTexto && (
        <span className="flex min-w-0 flex-col items-start text-left">
          {etiqueta && (
            <span className="text-sm font-medium text-[var(--admin-texto)]">{etiqueta}</span>
          )}
          {descripcion && (
            <span className="mt-0.5 text-xs text-[var(--admin-texto-suave)]">{descripcion}</span>
          )}
        </span>
      )}
      {ladoDerecho}
    </button>
  );
}
