"use client";

import { CLASE_INPUT } from "@/lib/productos/estilos";

interface Props {
  price: string;
  maxPrice: string;
  onPrice: (valor: string) => void;
  onMaxPrice: (valor: string) => void;
}

export default function ProductoPrecio({ price, maxPrice, onPrice, onMaxPrice }: Props) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--admin-texto)]">Precio</h3>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--admin-texto-suave)]">
            Precio de venta *
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--admin-texto-suave)]">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`${CLASE_INPUT} pl-8 font-semibold text-[var(--admin-primario)]`}
              placeholder="0,00"
              value={price}
              onChange={(e) => onPrice(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--admin-texto-suave)]">
            Precio anterior (opcional)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--admin-texto-suave)]">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`${CLASE_INPUT} pl-8`}
              placeholder="0,00"
              value={maxPrice}
              onChange={(e) => onMaxPrice(e.target.value)}
            />
          </div>
          <p className="text-xs text-[var(--admin-texto-suave)]">
            Se mostrará como precio tachado en la tienda.
          </p>
        </div>
      </div>
    </section>
  );
}
