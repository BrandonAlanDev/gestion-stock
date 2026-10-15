"use client";

import { Circle, CheckCircle2 } from "lucide-react";

export interface MetodoCheckout {
  id: string;
  nombre: string;
  descripcion: string;
}

interface PropiedadesSelectorMetodoPago {
  metodo: MetodoCheckout;
  seleccionado: boolean;
  alSeleccionar: (id: string) => void;
}

export default function SelectorMetodoPago({
  metodo,
  seleccionado,
  alSeleccionar,
}: PropiedadesSelectorMetodoPago) {
  return (
    <button
      type="button"
      onClick={() => alSeleccionar(metodo.id)}
      className={`flex items-center gap-3 rounded-xl p-4 border text-left cursor-pointer transition-colors ${
        seleccionado
          ? "border-[color-mix(in_srgb,var(--color-primario)_40%,transparent)]"
          : "border-[color-mix(in_srgb,var(--texto-sobre-fondo)_12%,transparent)]"
      }`}
      style={{
        backgroundColor: seleccionado
          ? "color-mix(in srgb, var(--color-primario) 10%, transparent)"
          : "transparent",
      }}
    >
      {seleccionado ? (
        <CheckCircle2 size={20} style={{ color: "var(--color-primario)" }} />
      ) : (
        <Circle size={20} className="opacity-40" />
      )}
      <span className="flex-1 min-w-0">
        <span className="block font-semibold">{metodo.nombre}</span>
        <span className="block text-sm opacity-70">{metodo.descripcion}</span>
      </span>
    </button>
  );
}
