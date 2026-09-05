"use client";

import Badge from "@/components/ui/badge";

interface ProductStatusBadgeProps {
  activo: boolean;
  stockTotal: number;
}

export default function ProductStatusBadge({ activo, stockTotal }: ProductStatusBadgeProps) {
  const variante = stockTotal <= 0 ? "sin-configurar" : activo ? "activo" : "oculto";
  const etiqueta = stockTotal <= 0 ? "Sin stock" : activo ? "Activo" : "Oculto";

  return <Badge variante={variante}>{etiqueta}</Badge>;
}
