"use client";

import Switch from "@/components/ui/switch";
import { CLASE_INPUT } from "@/lib/productos/estilos";

interface Props {
  controlaStock: boolean;
  onControlaStock: (valor: boolean) => void;
  conVariantes: boolean;
  stock: string;
  onStock: (valor: string) => void;
  codigo: string;
  onCodigo: (valor: string) => void;
}

export default function ProductoInventario({ controlaStock, onControlaStock, conVariantes, stock, onStock, codigo, onCodigo }: Props) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-[var(--admin-texto)]">Inventario</h3>
      <div className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-4 py-2">
        <Switch
          activo={controlaStock}
          alCambiar={onControlaStock}
          etiqueta="Controlar stock"
          descripcion="Gestioná la cantidad disponible de este producto."
          mostrarEstado
        />
      </div>
      {conVariantes ? (
        <p className="text-xs text-[var(--admin-texto-suave)]">
          El stock se administra por variante.
        </p>
      ) : (
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--admin-texto-suave)]">Stock inicial</label>
            <input
              type="number"
              min="0"
              className={CLASE_INPUT}
              placeholder="0"
              value={stock}
              onChange={(e) => onStock(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--admin-texto-suave)]">Código del producto (opcional)</label>
            <input
              className={`${CLASE_INPUT} font-mono uppercase`}
              placeholder="Ej. PROD-001"
              value={codigo}
              onChange={(e) => onCodigo(e.target.value)}
            />
            <p className="text-xs text-[var(--admin-texto-suave)]">
              Código interno para identificar el producto.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
