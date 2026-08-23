import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type VarianteBadge =
  | "activo"
  | "inactivo"
  | "oculto"
  | "sin-configurar"
  | "borrador"
  | "info";

interface BadgeProps {
  variante?: VarianteBadge;
  children: ReactNode;
  className?: string;
}

const estilosVariante: Record<VarianteBadge, string> = {
  activo: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  inactivo: "text-[var(--admin-texto-suave)] border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]",
  oculto: "text-[var(--admin-texto-suave)] border-[var(--admin-borde)] bg-[var(--admin-fondo)]",
  "sin-configurar": "text-amber-300 border-amber-500/30 bg-amber-500/10",
  borrador: "text-purple-300 border-purple-500/30 bg-purple-500/10",
  info: "text-[var(--admin-primario)] border-[var(--admin-primario-suave)] bg-[var(--admin-primario-suave)]",
};

const colorPunto: Record<VarianteBadge, string> = {
  activo: "bg-emerald-400",
  inactivo: "bg-[var(--admin-texto-suave)]",
  oculto: "bg-[var(--admin-fondo-hover)]",
  "sin-configurar": "bg-amber-400",
  borrador: "bg-purple-400",
  info: "bg-[var(--admin-primario)]",
};

export default function Badge({ variante = "info", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        estilosVariante[variante],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", colorPunto[variante])} />
      {children}
    </span>
  );
}
