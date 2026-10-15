import type { ModeloVisual } from "@/lib/productos/opciones-visuales";

export function varianteCompleta(modelo: ModeloVisual, seleccion: Record<string, string>) {
  const claves = Object.keys(seleccion);
  if (claves.length === 0) return null;
  return modelo.variantes.find((v) => claves.every((clave) => v.combinacion[clave] === seleccion[clave])) ?? null;
}
