"use client";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { Search as SearchIcon } from "lucide-react";
import { useRef } from "react";

interface SearchProps {
  initialValue?: string;
  onChange: (value: string) => void;
  className?: string;
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

export default function Search({ initialValue = "", onChange, className }: SearchProps) {
  const pageConfig = usePageConfig();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Variables dinámicas de color
  const secondaryColor = pageConfig?.pageConfig?.secondaryColor || "#FFFFFF";

  // Cálculos de legibilidad y contraste
  const textColor = getContrastColor(secondaryColor);
  const isDarkBg = textColor === "#ffffff";

  // Diseños basados en el fondo de la página
  const overlayBorder = isDarkBg ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(value);
    }, 300);
  };

  return (
    <div className={`relative ${className || ""}`}>
      <SearchIcon 
        size={16} 
        className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 transition-opacity" 
        style={{ color: textColor }}
      />
      <input
        type="text"
        placeholder="Buscar producto..."
        defaultValue={initialValue}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none"
        style={{
          backgroundColor: secondaryColor,
          border: `1px solid ${overlayBorder}`,
          color: textColor,
        }}
      />
    </div>
  );
}