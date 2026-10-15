"use client";

import { X, Plus } from "lucide-react";
import { CLASE_INPUT } from "@/lib/productos/estilos";

interface Props {
  indice: number;
  nombre: string;
  valores: string[];
  onCambiarNombre: (valor: string) => void;
  onEliminar: () => void;
  onCambiarValor: (indiceValor: number, valor: string) => void;
  onAgregarValor: () => void;
  onEliminarValor: (indiceValor: number) => void;
}

export default function EditorOpcion({
  indice,
  nombre,
  valores,
  onCambiarNombre,
  onEliminar,
  onCambiarValor,
  onAgregarValor,
  onEliminarValor,
}: Props) {
  return (
    <div className="space-y-3 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--admin-texto-suave)]">
          Opción {indice + 1}
        </span>
        <button
          type="button"
          onClick={onEliminar}
          aria-label="Eliminar opción"
          className="ml-auto cursor-pointer rounded-md p-1 text-[var(--admin-texto-suave)] transition hover:text-red-400"
        >
          <X size={16} />
        </button>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--admin-texto-suave)]">Nombre de la opción</label>
        <input
          className={CLASE_INPUT}
          placeholder="Ej. Color, Tamaño, Material"
          value={nombre}
          onChange={(e) => onCambiarNombre(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--admin-texto-suave)]">Valores</label>
        <div className="flex flex-wrap gap-2">
          {valores.map((valor, indiceValor) => (
            <div key={indiceValor} className="flex items-center gap-1 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-2 py-1.5">
              <input
                className="w-24 bg-transparent text-sm text-[var(--admin-texto)] focus:outline-none"
                value={valor}
                placeholder="Valor"
                onChange={(e) => onCambiarValor(indiceValor, e.target.value)}
              />
              <button
                type="button"
                onClick={() => onEliminarValor(indiceValor)}
                aria-label="Quitar valor"
                className="cursor-pointer text-[var(--admin-texto-suave)] transition hover:text-red-400"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onAgregarValor}
          className="inline-flex items-center gap-1 cursor-pointer rounded-lg border border-dashed border-[var(--admin-borde)] px-3 py-1.5 text-xs font-medium text-[var(--admin-texto-suave)] transition hover:border-[var(--admin-primario)] hover:text-[var(--admin-primario)]"
        >
          <Plus size={14} />
          Agregar valor
        </button>
      </div>
    </div>
  );
}
