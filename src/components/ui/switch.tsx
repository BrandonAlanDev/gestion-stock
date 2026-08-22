"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  activo: boolean;
  alCambiar: (valor: boolean) => void;
  etiqueta?: string;
  descripcion?: string;
  deshabilitado?: boolean;
}

export default function Switch({
  activo,
  alCambiar,
  etiqueta,
  descripcion,
  deshabilitado,
}: SwitchProps) {
  const conTexto = Boolean(etiqueta || descripcion);

  const toggle = (
    <span
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
        activo ? "bg-[var(--admin-primario)]" : "bg-[var(--admin-fondo-hover)]",
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

  const clasesBase = cn(
    deshabilitado && "pointer-events-none opacity-50",
    conTexto && "flex w-full items-center justify-between gap-4 py-3",
  );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      disabled={deshabilitado}
      onClick={() => alCambiar(!activo)}
      className={clasesBase}
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
      {toggle}
    </button>
  );
}
