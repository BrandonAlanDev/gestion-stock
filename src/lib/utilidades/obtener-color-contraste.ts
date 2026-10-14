export function obtenerColorContraste(colorHex: string): string {
  if (!colorHex) return "#000000";
  const hex = colorHex.replace("#", "");
  const rojo = parseInt(hex.substring(0, 2), 16) || 0;
  const verde = parseInt(hex.substring(2, 4), 16) || 0;
  const azul = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (rojo * 299 + verde * 587 + azul * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}
