"use client";

import type { VarianteFormulario } from "@/hooks/use-formulario-producto";

interface Props {
  variantes: VarianteFormulario[];
  precioGeneral: string;
  onActualizarVariante: (indice: number, campo: "stock" | "sku" | "priceOverride", valor: unknown) => void;
}

const clasesInput =
  "w-full rounded-md border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-2 py-1.5 text-sm text-[var(--admin-texto)] placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)] focus:outline-none";

export default function TablaVariantes({ variantes, precioGeneral, onActualizarVariante }: Props) {
  return (
    <div className="space-y-3">
      {variantes.map((variante, indice) => {
        const nombreVariante = variante.opcionValores.map((par) => par.valor).join(" / ") || "—";
        const esPersonalizado = Boolean(variante.priceOverride);

        return (
          <div
            key={`${nombreVariante}-${indice}`}
            className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-[var(--admin-texto)]">{nombreVariante}</h4>
              <span className="text-xs text-[var(--admin-texto-suave)]">
                {esPersonalizado ? "Precio personalizado" : "Precio general"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--admin-texto-suave)]">Precio</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--admin-texto-suave)]">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`${clasesInput} pl-6`}
                    placeholder={precioGeneral || "0"}
                    value={variante.priceOverride}
                    onChange={(e) => onActualizarVariante(indice, "priceOverride", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--admin-texto-suave)]">Stock</label>
                <input
                  type="number"
                  min="0"
                  className={clasesInput}
                  value={variante.stock}
                  onChange={(e) => onActualizarVariante(indice, "stock", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--admin-texto-suave)]">Código / SKU</label>
                <input
                  className={`${clasesInput} font-mono uppercase`}
                  value={variante.sku}
                  placeholder="Código"
                  onChange={(e) => onActualizarVariante(indice, "sku", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--admin-texto-suave)]">Precio general</label>
                <div className="flex h-[38px] items-center rounded-md border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-2 text-sm text-[var(--admin-texto)]">
                  {precioGeneral ? `$ ${precioGeneral}` : "—"}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
