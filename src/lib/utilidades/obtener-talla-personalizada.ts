export function obtenerTallaPersonalizada(atributos: unknown): string | null {
  if (!atributos || typeof atributos !== "object") return null;
  if (!("customSize" in atributos)) return null;
  const valor = atributos.customSize;
  return typeof valor === "string" && valor.trim() ? valor : null;
}
