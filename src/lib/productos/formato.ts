export function formatearMoneda(valor: unknown): string {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return "$0";
  return `$${numero.toLocaleString("es-AR")}`;
}
