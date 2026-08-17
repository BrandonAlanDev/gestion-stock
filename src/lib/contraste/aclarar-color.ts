function esHexValido(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(color);
}

/**
 * Devuelve el color `hex` aclarado mezclándolo hacia blanco según `cantidad` (0-1).
 * Si el color no es un hex válido de 6 dígitos, lo devuelve sin cambios.
 */
export function aclararColor(hex: string, cantidad: number): string {
  if (!esHexValido(hex)) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mezclar = (c: number) => Math.round(c + (255 - c) * cantidad);
  const aHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${aHex(mezclar(r))}${aHex(mezclar(g))}${aHex(mezclar(b))}`;
}
