"use client";

import { X } from "lucide-react";
import ColorDropdown from "@/components/ui/color-dropdown";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";

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

export default function VariantRow({
  variant,
  index,
  availableSizes,
  colors,
  onRemove,
  onUpdate,
  onUpdateCustomSize,
}: VariantRowProps) {
  const { pageConfig } = usePageConfig();
  const background = (pageConfig?.secondaryColor as string) || "#00b4d8";
  const accent = (pageConfig?.primaryColor as string) || "#FFFFFF";
  const textColor = getContrastColor(background);
  const accentTextColor = getContrastColor(accent);
  const isDarkBg = textColor === "#ffffff";
  const inputBg = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const overlayBorder = isDarkBg ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const mutedColor = textColor + "99";

  return (
    <div
      className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-12 sm:items-center"
      style={{
        background: inputBg,
        border: `1px solid ${overlayBorder}`,
        borderRadius: "16px",
      }}
    >
      {/* Talle */}
      <div className="col-span-1 flex flex-col gap-1 sm:col-span-3">
        <select
          className="w-full text-xs font-medium outline-none"
          style={{ background: "transparent", color: textColor, border: "none" }}
          value={variant.sizeId}
          onChange={(e) => onUpdate(index, "sizeId", e.target.value)}
          required
        >
          <option value="" style={{ background: inputBg, color: mutedColor }}>
            Talle...
          </option>
          {availableSizes.map((s) => (
            <option key={s.id} value={s.id} style={{ background: background, color: textColor }}>
              {String(s.value)}
            </option>
          ))}
          <option value="CUSTOM" style={{ background: accent, color: accentTextColor, fontWeight: 700 }}>
            Personalizado...
          </option>
        </select>
        {variant.sizeId === "CUSTOM" && (
          <input
            type="text"
            placeholder="Medida (ej: 5'8 x 20 x 2)"
            style={{
              background: `${accent}1A`,
              border: `1px solid ${overlayBorder}`,
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "10px",
              color: textColor,
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
      <div className="col-span-1 pl-0 sm:col-span-3 sm:pl-3" style={{ borderLeft: `1px solid ${overlayBorder}` }}>
        <ColorDropdown
          colors={colors}
          value={variant.colorId}
          onChange={(id) => onUpdate(index, "colorId", id)}
        />
      </div>

      {/* Stock */}
      <div className="col-span-1 pl-0 sm:col-span-2 sm:pl-3" style={{ borderLeft: `1px solid ${overlayBorder}` }}>
        <input
          type="number"
          placeholder="Stock"
          className="w-full text-xs outline-none"
          style={{ background: "transparent", color: textColor, border: "none" }}
          value={variant.stock}
          onChange={(e) => onUpdate(index, "stock", parseInt(e.target.value) || 0)}
          required
        />
      </div>

      {/* SKU */}
      <div className="col-span-1 pl-0 sm:col-span-3 sm:pl-3" style={{ borderLeft: `1px solid ${overlayBorder}` }}>
        <input
          placeholder="SKU"
          className="w-full text-[10px] outline-none uppercase font-mono"
          style={{ background: "transparent", color: mutedColor, border: "none" }}
          value={variant.sku}
          onChange={(e) => onUpdate(index, "sku", e.target.value)}
        />
      </div>

      {/* Eliminar */}
      <div className="col-span-1 flex justify-start sm:justify-end sm:col-span-1">
        <button
          type="button"
          onClick={() => onRemove(index)}
          style={{ color: overlayBorder }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#ef4444")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = overlayBorder)}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
