export function normalizarEnlaceNavegable(valor: unknown): string | null {
  if (typeof valor !== "string") return null;

  const enlace = valor.trim();
  if (!enlace) return null;

  if (enlace.startsWith("/") && !enlace.startsWith("//") && !enlace.includes("\\")) {
    return enlace;
  }

  try {
    const url = new URL(enlace);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
