"use client";

import { useAdminPaleta } from "@/hooks/use-admin-paleta";

interface ProductStatusBadgeProps {
  activo: boolean;
  stockTotal: number;
}

export default function ProductStatusBadge({ activo, stockTotal }: ProductStatusBadgeProps) {
  const paleta = useAdminPaleta();

  let etiqueta: string;
  let texto: string;
  let bg: string;
  let borde: string;
  let punto: string;

  if (stockTotal <= 0) {
    etiqueta = "Sin stock";
    texto = "#b45309";
    bg = "rgba(245,158,11,0.12)";
    borde = "rgba(245,158,11,0.25)";
    punto = "#f59e0b";
  } else if (!activo) {
    etiqueta = "Oculto";
    texto = paleta.textoSuave;
    bg = paleta.fondoSuave;
    borde = paleta.borde;
    punto = paleta.textoSuave;
  } else {
    etiqueta = "Activo";
    texto = "#15803d";
    bg = "rgba(34,197,94,0.12)";
    borde = "rgba(34,197,94,0.25)";
    punto = "#22c55e";
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
      style={{ color: texto, backgroundColor: bg, borderColor: borde }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: punto }} />
      {etiqueta}
    </span>
  );
}
