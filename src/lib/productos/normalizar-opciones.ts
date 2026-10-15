import type { ParOpcionValor } from "@/types/productos/opciones-producto";

const normalizar = (texto: string): string => texto.trim().toLowerCase();

export function claveOpcionValor(par: ParOpcionValor): string {
  return `${normalizar(par.opcion)}::${normalizar(par.valor)}`;
}
