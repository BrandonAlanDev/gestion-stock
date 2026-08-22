"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

/* ── Paleta (misma que ProductModal) ─────────────────────────────────
   #ffffff   blanco — fondos principales
   #f0fafa   cyan muy claro — fondos suaves
   #e0f5f5   cyan claro — inputs, variantes
   #b2dede   cyan borde
   #4ab8b8   cyan acento
   #0d5c63   verde marino — detalles, iconos
   #083d42   verde marino oscuro — títulos
   #0d2b2e   texto principal
   #4a7c80   texto secundario
─────────────────────────────────────────────────────────────────── */

interface Color {
  id: string;
  name: string;
  hex?: string | null;
  active?: boolean;
}

interface ColorDropdownProps {
  colors: Color[];
  value: string;
  onChange: (id: string) => void;
}

export default function ColorDropdown({ colors, value, onChange }: ColorDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = colors.find((c) => c.id === value);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Botón disparador */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full cursor-pointer py-1 uppercase text-xs font-medium select-none"
        style={{ color: selected ? "#0d2b2e" : "#4a7c80" }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(!open)}
      >
        <span>{selected ? selected.name : "Color..."}</span>
        <ChevronDown
          size={12}
          style={{
            color: "#4a7c80",
            transition: "transform 0.15s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </div>

      {/* Lista desplegable */}
      {open && (
        <div
          className="absolute top-full left-0 z-[110] w-48 mt-2 overflow-hidden shadow-xl"
          style={{
            background: "#ffffff",
            border: "1px solid #b2dede",
            borderRadius: "12px",
          }}
        >
          <div className="max-h-48 overflow-y-auto">
            {colors.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
                className="px-4 py-2 text-[11px] cursor-pointer transition-colors"
                style={{ color: "#0d2b2e" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "#e0f5f5";
                  (e.currentTarget as HTMLDivElement).style.color = "#0d5c63";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  (e.currentTarget as HTMLDivElement).style.color = "#0d2b2e";
                }}
                role="option"
                aria-selected={c.id === value}
              >
                {c.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}