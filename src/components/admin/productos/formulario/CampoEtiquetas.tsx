"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { CLASE_INPUT } from "@/lib/productos/estilos";

interface Props {
  etiquetas: string[];
  onAgregar: (etiqueta: string) => void;
  onEliminar: (etiqueta: string) => void;
}

export default function CampoEtiquetas({ etiquetas, onAgregar, onEliminar }: Props) {
  const [valor, setValor] = useState("");

  const agregar = () => {
    onAgregar(valor);
    setValor("");
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-[var(--admin-texto-suave)]">Etiquetas</label>
      <div className="flex items-center gap-2">
        <input
          className={CLASE_INPUT}
          placeholder="Ej. oferta, nuevo, destacado"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              agregar();
            }
          }}
        />
        <button
          type="button"
          onClick={agregar}
          aria-label="Agregar etiqueta"
          className="cursor-pointer rounded-lg border border-[var(--admin-borde)] p-2 text-[var(--admin-texto)] transition hover:bg-[var(--admin-fondo-hover)]"
        >
          <Plus size={16} />
        </button>
      </div>
      {etiquetas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {etiquetas.map((etiqueta) => (
            <span
              key={etiqueta}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--admin-fondo-hover)] px-2.5 py-1 text-xs font-medium text-[var(--admin-texto)]"
            >
              {etiqueta}
              <button
                type="button"
                onClick={() => onEliminar(etiqueta)}
                aria-label={`Quitar ${etiqueta}`}
                className="cursor-pointer text-[var(--admin-texto-suave)] transition hover:text-red-400"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
