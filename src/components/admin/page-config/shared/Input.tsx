"use client";

import type { CSSProperties } from "react";
import { cn, getContrastColor } from "@/lib/utils";

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
  primaryColor = "#06b6d4",
  secondaryColor = "#ffffff",
}: Props) {
  const textColor = getContrastColor(secondaryColor);

  return (
    <div>
      {label && (
        <label className="text-[10px] uppercase tracking-[0.3em] font-black block mb-3" style={{ color: textColor }}>
          {label}
        </label>
      )}

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={
          {
            "--input-fondo": textColor + "08",
            "--input-borde": textColor + "30",
            "--input-texto": textColor,
            "--input-placeholder": textColor + "80",
            "--input-foco": primaryColor,
          } as CSSProperties
        }
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-200 bg-[var(--input-fondo)] border-[var(--input-borde)] text-[var(--input-texto)] placeholder:text-[var(--input-placeholder)] focus:border-[var(--input-foco)] focus:ring-2 ring-[var(--input-foco)]/20",
          className
        )}
      />
    </div>
  );
}
