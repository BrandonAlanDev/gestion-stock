"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";

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
  const { pageConfig } = usePageConfig();
  const background = (pageConfig?.secondaryColor as string) || "#00b4d8";
  const accent = (pageConfig?.primaryColor as string) || "#FFFFFF";
  const textColor = getContrastColor(background);
  const isDarkBg = textColor === "#ffffff";
  const overlayBorder = isDarkBg ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const mutedColor = textColor + "99";
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
        style={{ color: selected ? textColor : mutedColor }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(!open)}
      >
        <span>{selected ? selected.name : "Color..."}</span>
        <ChevronDown
          size={12}
          style={{
            color: mutedColor,
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
            background: background,
            border: `1px solid ${overlayBorder}`,
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
                style={{ color: textColor }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = `${accent}1A`;
                  (e.currentTarget as HTMLDivElement).style.color = accent;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  (e.currentTarget as HTMLDivElement).style.color = textColor;
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
