"use client";

import { cn, getContrastColor } from "@/lib/utils";

interface HeroLayoutPickerProps {
  value: "standard" | "split" | "minimal";
  onChange: (value: "standard" | "split" | "minimal") => void;
  primaryColor: string;
  secondaryColor: string;
}

const LAYOUTS = [
  { id: "standard", label: "Estándar", desc: "Imagen completa con texto centrado" },
  { id: "split", label: "Dividido", desc: "Imagen a la izquierda y texto a la derecha" },
  { id: "minimal", label: "Minimalista", desc: "Imagen completa sin oscurecer, texto más sutil" },
] as const;

export default function HeroLayoutPicker({ value, onChange, primaryColor, secondaryColor }: HeroLayoutPickerProps) {
  const textColor = getContrastColor(secondaryColor);
  const bgColor = primaryColor + "1A";
  const activeBgColor = primaryColor + "20";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>Diseño visual</label>
      <div className="grid grid-cols-3 gap-2">
        {LAYOUTS.map((layout) => (
          <button
            key={layout.id}
            type="button"
            onClick={() => onChange(layout.id)}
            className={cn(
              "p-3 rounded-xl border-2 transition-all text-left"
            )} style={{
              borderColor: value === layout.id ? primaryColor : textColor + "30",
              backgroundColor: value === layout.id ? activeBgColor : bgColor,
            }}
            onMouseEnter={(e) => {
              if (value !== layout.id) {
                e.currentTarget.style.borderColor = primaryColor;
                e.currentTarget.style.backgroundColor = primaryColor + "20";
              }
            }}
            onMouseLeave={(e) => {
              if (value !== layout.id) {
                e.currentTarget.style.borderColor = textColor + "30";
                e.currentTarget.style.backgroundColor = bgColor;
              }
            }}
          >
            <span className="font-medium block mb-1" style={{ color: textColor }}>{layout.label}</span>
            <span className="text-xs" style={{ color: textColor + "99" }}>{layout.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}