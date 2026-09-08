"use client";

import { Plus } from "lucide-react";
import EditorOpcion from "./EditorOpcion";
import TablaVariantes from "./TablaVariantes";
import { MAX_OPCIONES, type OpcionFormulario, type VarianteFormulario } from "@/hooks/use-formulario-producto";

const EJEMPLOS = ["Talle", "Color", "Tamaño", "Capacidad", "Sabor", "Material"];

interface Props {
  opciones: OpcionFormulario[];
  variantes: VarianteFormulario[];
  precioGeneral: string;
  onAgregarOpcion: () => void;
  onEliminarOpcion: (indice: number) => void;
  onCambiarNombreOpcion: (indice: number, valor: string) => void;
  onCambiarValorOpcion: (indice: number, indiceValor: number, valor: string) => void;
  onAgregarValorOpcion: (indice: number) => void;
  onEliminarValorOpcion: (indice: number, indiceValor: number) => void;
  onActualizarVariante: (indice: number, campo: "stock" | "sku" | "priceOverride", valor: unknown) => void;
}

export default function ProductoOpciones({
  opciones,
  variantes,
  precioGeneral,
  onAgregarOpcion,
  onEliminarOpcion,
  onCambiarNombreOpcion,
  onCambiarValorOpcion,
  onAgregarValorOpcion,
  onEliminarValorOpcion,
  onActualizarVariante,
}: Props) {
  const sinVariantes = opciones.length === 0;
  const limiteAlcanzado = opciones.length >= MAX_OPCIONES;

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--admin-texto)]">Variantes (opcional)</h3>
        <p className="mt-0.5 text-xs text-[var(--admin-texto-suave)]">
          Agregá variantes si tu producto tiene diferentes opciones, como talle, color, tamaño, capacidad, sabor, material, etc.
        </p>
      </div>

      {sinVariantes ? (
        <div className="space-y-3 rounded-xl border border-dashed border-[var(--admin-borde)] p-5 text-center">
          <p className="text-sm text-[var(--admin-texto)]">Este producto no tiene variantes</p>
          <p className="text-xs text-[var(--admin-texto-suave)]">
            Hacé clic en &quot;Agregar opción&quot; para crear variantes.
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {EJEMPLOS.map((ejemplo) => (
              <span key={ejemplo} className="rounded-full bg-[var(--admin-fondo-hover)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--admin-texto-suave)]">
                {ejemplo}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onAgregarOpcion}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--admin-primario)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-primario-texto)] transition hover:opacity-90"
          >
            <Plus size={14} />
            Agregar opción
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {opciones.map((opcion, indice) => (
              <EditorOpcion
                key={indice}
                indice={indice}
                nombre={opcion.name}
                valores={opcion.values}
                onCambiarNombre={(valor) => onCambiarNombreOpcion(indice, valor)}
                onEliminar={() => onEliminarOpcion(indice)}
                onCambiarValor={(indiceValor, valor) => onCambiarValorOpcion(indice, indiceValor, valor)}
                onAgregarValor={() => onAgregarValorOpcion(indice)}
                onEliminarValor={(indiceValor) => onEliminarValorOpcion(indice, indiceValor)}
              />
            ))}
          </div>

          {variantes.length > 0 && (
            <TablaVariantes variantes={variantes} precioGeneral={precioGeneral} onActualizarVariante={onActualizarVariante} />
          )}

          <button
            type="button"
            onClick={onAgregarOpcion}
            disabled={limiteAlcanzado}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-dashed border-[var(--admin-borde)] px-3 py-1.5 text-xs font-medium text-[var(--admin-texto-suave)] transition hover:border-[var(--admin-primario)] hover:text-[var(--admin-primario)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} />
            {limiteAlcanzado ? `Máximo ${MAX_OPCIONES} opciones` : "Agregar otra opción"}
          </button>
        </div>
      )}
    </section>
  );
}
