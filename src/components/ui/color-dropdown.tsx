"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

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
        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-2 py-1.5 text-xs font-medium uppercase text-[var(--admin-texto)]"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(!open)}
      >
        <span className={selected ? "text-[var(--admin-texto)]" : "text-[var(--admin-texto-suave)]"}>
          {selected ? selected.name : "Color..."}
        </span>
        <ChevronDown
          size={12}
          className="text-[var(--admin-texto-suave)] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </div>

      {/* Lista desplegable */}
      {open && (
        <div className="absolute left-0 top-full z-[110] mt-2 w-48 overflow-hidden rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] shadow-xl">
          <div className="max-h-48 overflow-y-auto">
            {colors.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
                className="cursor-pointer px-4 py-2 text-[11px] text-[var(--admin-texto)] transition-colors hover:bg-[var(--admin-fondo-hover)]"
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
