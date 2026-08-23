export function normalizarUrlHttps(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;

  try {
    const resultado = new URL(url.trim());
    return resultado.protocol === "https:" ? resultado.href : null;
  } catch {
    return null;
  }
}