import type { ReactNode } from "react";

import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";

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
  activo: "text-[var(--admin-exito)] border-[color-mix(in_srgb,var(--admin-exito)_30%,transparent)] bg-[var(--admin-exito-suave)]",
  inactivo: "text-[var(--admin-texto-suave)] border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]",
  oculto: "text-[var(--admin-texto-suave)] border-[var(--admin-borde)] bg-[var(--admin-fondo)]",
  "sin-configurar": "text-[var(--admin-aviso)] border-[color-mix(in_srgb,var(--admin-aviso)_30%,transparent)] bg-[var(--admin-aviso-suave)]",
  borrador: "text-[var(--admin-acento)] border-[color-mix(in_srgb,var(--admin-acento)_30%,transparent)] bg-[var(--admin-acento-suave)]",
  info: "text-[var(--admin-primario)] border-[var(--admin-primario-suave)] bg-[var(--admin-primario-suave)]",
};

const colorPunto: Record<VarianteBadge, string> = {
  activo: "bg-[var(--admin-exito)]",
  inactivo: "bg-[var(--admin-texto-suave)]",
  oculto: "bg-[var(--admin-fondo-hover)]",
  "sin-configurar": "bg-[var(--admin-aviso)]",
  borrador: "bg-[var(--admin-acento)]",
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
