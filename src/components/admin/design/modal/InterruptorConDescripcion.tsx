"use client";

interface InterruptorConDescripcionProps {
  activo: boolean;
  etiqueta: string;
  descripcion: string;
  alCambiar: () => void;
}

export default function InterruptorConDescripcion({
  activo,
  etiqueta,
  descripcion,
  alCambiar,
}: InterruptorConDescripcionProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-[var(--admin-texto)]">
          {etiqueta}
        </p>
        <p className="text-xs text-[var(--admin-texto-suave)]">
          {descripcion}
        </p>
      </div>
      <button
        type="button"
        onClick={alCambiar}
        aria-label={etiqueta}
        role="switch"
        aria-checked={activo}
        className={`relative h-7 w-14 shrink-0 cursor-pointer rounded-full transition-colors ${activo ? "bg-[var(--admin-primario)]" : "bg-[var(--admin-fondo-hover)]"}`}
      >
        <div
          className="absolute top-1 h-5 w-5 rounded-full border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] shadow transition-transform"
          style={{ left: activo ? "calc(100% - 24px)" : "4px" }}
        />
      </button>
    </div>
  );
}
