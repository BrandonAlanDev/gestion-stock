"use client";

interface InterruptorConDescripcionProps {
  activo: boolean;
  etiqueta: string;
  descripcion: string;
  alCambiar: () => void;
  primaryColor: string;
  textColor: string;
}

export default function InterruptorConDescripcion({
  activo,
  etiqueta,
  descripcion,
  alCambiar,
  primaryColor,
  textColor,
}: InterruptorConDescripcionProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium" style={{ color: textColor + "CC" }}>
          {etiqueta}
        </p>
        <p className="text-xs" style={{ color: textColor + "80" }}>
          {descripcion}
        </p>
      </div>
      <button
        type="button"
        onClick={alCambiar}
        aria-label={etiqueta}
        role="switch"
        aria-checked={activo}
        className="relative h-7 w-14 shrink-0 rounded-full transition-colors cursor-pointer"
        style={{ backgroundColor: activo ? primaryColor : textColor + "40" }}
      >
        <div
          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ left: activo ? "calc(100% - 24px)" : "4px" }}
        />
      </button>
    </div>
  );
}
