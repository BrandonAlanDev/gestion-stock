"use client";

import Badge from "@/components/ui/badge";
import type { VarianteAdminResumen } from "@/lib/productos/tipos";

interface InsigniaEstadoProductoProps {
  activo: boolean;
  stockTotal: number;
  esConVariantes?: boolean;
  variantes?: VarianteAdminResumen[];
}

function sinStock(producto: InsigniaEstadoProductoProps): boolean {
  if (producto.esConVariantes) {
    return (producto.variantes ?? []).every((variante) => variante.stock <= 0);
  }
  return producto.stockTotal <= 0;
}

export default function InsigniaEstadoProducto({
  activo,
  stockTotal,
  esConVariantes = false,
  variantes,
}: InsigniaEstadoProductoProps) {
  const sinStockProducto = sinStock({ activo, stockTotal, esConVariantes, variantes });
  const variante = sinStockProducto ? "sin-configurar" : activo ? "activo" : "oculto";
  const etiqueta = sinStockProducto ? "Sin stock" : activo ? "Activo" : "Oculto";

  return <Badge variante={variante}>{etiqueta}</Badge>;
}
