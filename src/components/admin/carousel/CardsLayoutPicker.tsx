"use client";

import { getContrastColor } from "@/lib/utils";

interface CardsLayoutPickerProps {
  layout: "grid" | "collage" | "minimal";
  onLayoutChange: (value: "grid" | "collage" | "minimal") => void;
  columns: string;
  onColumnsChange: (value: string) => void;
  cardHeight: string;
  onCardHeightChange: (value: string) => void;
  showSubtitle: boolean;
  onShowSubtitleChange: (value: boolean) => void;
  enableHoverZoom: boolean;
  onEnableHoverZoomChange: (value: boolean) => void;
  primaryColor?: string;
  secondaryColor?: string;
}

const LAYOUTS = [
  { id: "grid", label: "Grid", desc: "Cuadrícula uniforme 2-4 columnas" },
  { id: "collage", label: "Collage", desc: "Mosaico asimétrico estilo Pinterest" },
  { id: "minimal", label: "Minimal", desc: "Una columna, tarjetas amplias" },
] as const;

const COLUMN_OPTIONS = [
  { value: "md:grid-cols-1", label: "1 columna" },
  { value: "md:grid-cols-2", label: "2 columnas" },
  { value: "md:grid-cols-3", label: "3 columnas" },
  { value: "md:grid-cols-4", label: "4 columnas" },
] as const;

const HEIGHT_OPTIONS = [
  { value: "40vh", label: "40vh (compacto)" },
  { value: "50vh", label: "50vh (estándar)" },
  { value: "60vh", label: "60vh (grande)" },
  { value: "70vh", label: "70vh (extra grande)" },
  { value: "80vh", label: "80vh (hero)" },
] as const;

export default function CardsLayoutPicker({
  layout,
  onLayoutChange,
  columns,
  onColumnsChange,
  cardHeight,
  onCardHeightChange,
  showSubtitle,
  onShowSubtitleChange,
  enableHoverZoom,
  onEnableHoverZoomChange,
  primaryColor = "#06b6d4",
  secondaryColor = "#fafafa",
}: CardsLayoutPickerProps) {
  const textColor = getContrastColor(secondaryColor);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: textColor + "CC" }}>Layout</label>
        <div className="grid grid-cols-3 gap-2">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => onLayoutChange(l.id)}
              className="p-3 rounded-xl border-2 transition-all text-left"
              style={{
                borderColor: layout === l.id ? primaryColor : textColor + "30",
                backgroundColor: layout === l.id ? primaryColor + "15" : "transparent",
              }}
            >
              <span className="font-medium block mb-1" style={{ color: textColor }}>{l.label}</span>
              <span className="text-xs" style={{ color: textColor + "80" }}>{l.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: textColor + "CC" }}>Columnas (md+)</label>
          <select
            value={columns}
            onChange={(e) => onColumnsChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg outline-none transition-all"
            style={{ backgroundColor: textColor + "1A", border: "1px solid " + textColor + "30", color: textColor }}
          >
            {COLUMN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ backgroundColor: secondaryColor, color: textColor }}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: textColor + "CC" }}>Alto de tarjetas</label>
          <select
            value={cardHeight}
            onChange={(e) => onCardHeightChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg outline-none transition-all"
            style={{ backgroundColor: textColor + "1A", border: "1px solid " + textColor + "30", color: textColor }}
          >
            {HEIGHT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ backgroundColor: secondaryColor, color: textColor }}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showSubtitle}
            onChange={(e) => onShowSubtitleChange(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: primaryColor }}
          />
          <span className="text-sm" style={{ color: textColor }}>Mostrar subtítulo</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enableHoverZoom}
            onChange={(e) => onEnableHoverZoomChange(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: primaryColor }}
          />
          <span className="text-sm" style={{ color: textColor }}>Zoom al hover</span>
        </label>
      </div>
    </div>
  );
}
