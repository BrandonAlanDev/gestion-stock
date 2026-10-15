import type { VarianteVisual } from "@/lib/productos/opciones-visuales";

export function precioDeVariante(precioGeneral: number, variante: VarianteVisual): number {
  return variante.priceOverride ?? precioGeneral;
}
