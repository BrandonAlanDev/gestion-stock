"use client";

import { X } from "lucide-react";
import ColorDropdown from "@/components/ui/color-dropdown";
import { colorOpcion } from "@/lib/productos/estilos";

interface Size {
  id: string;
  value: string;
}

interface Color {
  id: string;
  name: string;
  hex?: string | null;
}

interface VariantRowProps {
  variant: {
    id?: string;
    sizeId: string;
    colorId: string;
    stock: number;
    sku: string;
    attributes?: { customSize?: string };
  };
  index: number;
  availableSizes: Size[];
  colors: Color[];
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: string, value: unknown) => void;
  onUpdateCustomSize: (index: number, value: string) => void;
}

const CLASE_CAMPO =
  "w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-2 py-1.5 text-xs text-[var(--admin-texto)] focus:border-[var(--admin-primario)] focus:outline-none";

export default function VariantRow({
  variant,
  index,
  availableSizes,
  colors,
  onRemove,
  onUpdate,
  onUpdateCustomSize,
}: VariantRowProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-3 sm:grid-cols-12 sm:items-center">
      {/* Talle */}
      <div className="col-span-1 flex flex-col gap-1 sm:col-span-3">
        <select
          className={CLASE_CAMPO}
          value={variant.sizeId}
          onChange={(e) => onUpdate(index, "sizeId", e.target.value)}
          required
        >
          <option value="" style={colorOpcion()}>
            Talle...
          </option>
          {availableSizes.map((s) => (
            <option key={s.id} value={s.id} style={colorOpcion()}>
              {String(s.value)}
            </option>
          ))}
          <option value="CUSTOM" style={{ backgroundColor: "var(--admin-primario)", color: "var(--admin-primario-texto)", fontWeight: 700 }}>
            Personalizado...
          </option>
        </select>
        {variant.sizeId === "CUSTOM" && (
          <input
            type="text"
            placeholder="Medida (ej: 5'8 x 20 x 2)"
            className="mt-1 w-full rounded-md border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-2 py-1 text-[10px] text-[var(--admin-texto)] focus:border-[var(--admin-primario)] focus:outline-none"
            value={variant.attributes?.customSize || ""}
            onChange={(e) => onUpdateCustomSize(index, e.target.value)}
            required
          />
        )}
      </div>

      {/* Color */}
      <div className="col-span-1 border-l border-[var(--admin-borde)] pl-0 sm:col-span-3 sm:pl-3">
        <ColorDropdown
          colors={colors}
          value={variant.colorId}
          onChange={(id) => onUpdate(index, "colorId", id)}
        />
      </div>

      {/* Stock */}
      <div className="col-span-1 border-l border-[var(--admin-borde)] pl-0 sm:col-span-2 sm:pl-3">
        <input
          type="number"
          placeholder="Stock"
          className={CLASE_CAMPO}
          value={variant.stock}
          onChange={(e) => onUpdate(index, "stock", parseInt(e.target.value) || 0)}
          required
        />
      </div>

      {/* SKU */}
      <div className="col-span-1 border-l border-[var(--admin-borde)] pl-0 sm:col-span-3 sm:pl-3">
        <input
          placeholder="SKU"
          className={`${CLASE_CAMPO} font-mono uppercase text-[var(--admin-texto-suave)]`}
          value={variant.sku}
          onChange={(e) => onUpdate(index, "sku", e.target.value)}
        />
      </div>

      {/* Eliminar */}
      <div className="col-span-1 flex justify-start sm:col-span-1 sm:justify-end">
        <button
          type="button"
          aria-label="Eliminar variante"
          onClick={() => onRemove(index)}
          className="cursor-pointer rounded-md p-1 text-[var(--admin-texto-suave)] transition hover:text-red-400"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
