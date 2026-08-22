"use client";

import { usePageConfig } from "@/components/providers/PageConfigProvider";

interface CategoryFilterProps {
  categories: Array<{ id: string; name: string }>;
  value: string;
  onChange: (categoryId: string) => void;
}

// --- UTILIDAD PARA CALCULAR EL CONTRASTE ---
function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function CategoryFilter({ categories, value, onChange }: CategoryFilterProps) {
  const pageConfig = usePageConfig();

  // Variables dinámicas de color
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#FFFFFF";

  // Cálculos de legibilidad y contraste
  const textColor = getContrastColor(secondaryColor);
  const isDarkBg = textColor === "#ffffff";

  const overlayBorder = isDarkBg ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)";

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none appearance-none cursor-pointer"
      style={{
        backgroundColor: secondaryColor,
        border: `1px solid ${overlayBorder}`,
        color: textColor,
      }}
    >
      <option value="" style={{ backgroundColor: secondaryColor, color: textColor }}>
        Todas las categorías
      </option>
      {categories.map((c) => (
        <option 
          key={c.id} 
          value={c.id} 
          style={{ backgroundColor: secondaryColor, color: textColor }}
        >
          {c.name}
        </option>
      ))}
    </select>
  );
}