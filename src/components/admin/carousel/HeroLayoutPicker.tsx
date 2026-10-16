"use client";

interface HeroLayoutPickerProps {
  value: "standard" | "split" | "minimal";
  onChange: (value: "standard" | "split" | "minimal") => void;
}

const LAYOUTS = [
  { id: "standard", label: "Estándar", desc: "Imagen completa con texto centrado" },
  { id: "split", label: "Dividido", desc: "Imagen a la izquierda y texto a la derecha" },
  { id: "minimal", label: "Minimalista", desc: "Imagen completa sin oscurecer, texto más sutil" },
] as const;

export default function HeroLayoutPicker({ value, onChange }: HeroLayoutPickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--admin-texto)]">Diseño visual</label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {LAYOUTS.map((layout) => (
          <button
            key={layout.id}
            type="button"
            onClick={() => onChange(layout.id)}
            className={`rounded-xl border-2 p-3 text-left transition-all ${value === layout.id ? "border-[var(--admin-primario)] bg-[var(--admin-primario)]/10" : "border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] hover:border-[var(--admin-primario)] hover:bg-[var(--admin-primario)]/10"}`}
          >
            <span className="mb-1 block font-medium text-[var(--admin-texto)]">{layout.label}</span>
            <span className="text-xs text-[var(--admin-texto-suave)]">{layout.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
