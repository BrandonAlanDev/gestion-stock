/** Regex de color hex en formato `#rrggbb`. */
const HEX_VALIDO = /^#[0-9a-fA-F]{6}$/;

/**
 * Devuelve true si `color` es un hex válido de 6 dígitos (`#rrggbb`).
 */
export function esColorHexValido(color: string): boolean {
  return HEX_VALIDO.test(color);
}
