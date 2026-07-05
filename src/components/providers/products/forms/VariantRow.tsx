"use client";

import { X } from "lucide-react";
import ColorDropdown from "@/components/ui/color-dropdown";

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
    attributes?: any;
  };
  index: number;
  availableSizes: Size[];
  colors: Color[];
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: string, value: any) => void;
  onUpdateCustomSize: (index: number, value: string) => void;
}

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
    <div
      className="grid grid-cols-12 gap-3 items-center p-3"
      style={{
        background: "#f0fafa",
        border: "1px solid #b2dede",
        borderRadius: "16px",
      }}
    >
      {/* Talle */}
      <div className="col-span-3 flex flex-col gap-1">
        <select
          className="w-full text-xs font-medium outline-none"
          style={{ background: "transparent", color: "#0d2b2e", border: "none" }}
          value={variant.sizeId}
          onChange={(e) => onUpdate(index, "sizeId", e.target.value)}
          required
        >
          <option value="" style={{ background: "#f0fafa", color: "#4a7c80" }}>
            Talle...
          </option>
          {availableSizes.map((s) => (
            <option key={s.id} value={s.id} style={{ background: "#fff", color: "#0d2b2e" }}>
              {String(s.value)}
            </option>
          ))}
          <option value="CUSTOM" style={{ background: "#e0f5f5", color: "#0d5c63", fontWeight: 700 }}>
            Personalizado...
          </option>
        </select>
        {variant.sizeId === "CUSTOM" && (
          <input
            type="text"
            placeholder="Medida (ej: 5'8 x 20 x 2)"
            style={{
              background: "#e0f5f5",
              border: "1px solid #b2dede",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "10px",
              color: "#0d2b2e",
              outline: "none",
              marginTop: "4px",
            }}
            value={variant.attributes?.customSize || ""}
            onChange={(e) => onUpdateCustomSize(index, e.target.value)}
            required
          />
        )}
      </div>

      {/* Color */}
      <div className="col-span-3 pl-3" style={{ borderLeft: "1px solid #b2dede" }}>
        <ColorDropdown
          colors={colors}
          value={variant.colorId}
          onChange={(id) => onUpdate(index, "colorId", id)}
        />
      </div>

      {/* Stock */}
      <div className="col-span-2 pl-3" style={{ borderLeft: "1px solid #b2dede" }}>
        <input
          type="number"
          placeholder="Stock"
          className="w-full text-xs outline-none"
          style={{ background: "transparent", color: "#0d2b2e", border: "none" }}
          value={variant.stock}
          onChange={(e) => onUpdate(index, "stock", parseInt(e.target.value) || 0)}
          required
        />
      </div>

      {/* SKU */}
      <div className="col-span-3 pl-3" style={{ borderLeft: "1px solid #b2dede" }}>
        <input
          placeholder="SKU"
          className="w-full text-[10px] outline-none uppercase font-mono"
          style={{ background: "transparent", color: "#4a7c80", border: "none" }}
          value={variant.sku}
          onChange={(e) => onUpdate(index, "sku", e.target.value)}
        />
      </div>

      {/* Eliminar */}
      <div className="col-span-1 flex justify-end">
        <button
          type="button"
          onClick={() => onRemove(index)}
          style={{ color: "#b2dede" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#e05050")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#b2dede")}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}