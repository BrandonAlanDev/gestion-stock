"use client";

import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function Input({
  label,
  value,
  onChange,
  placeholder,
  className,
}: Props) {
  return (
    <div>
      {label && (
        <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.3em] text-[var(--admin-texto-suave)]">
          {label}
        </label>
      )}

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-4 py-2.5 text-sm text-[var(--admin-texto)] outline-none transition-all duration-200 placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)] focus:ring-2 focus:ring-[var(--admin-primario)]/20",
          className
        )}
      />
    </div>
  );
}
