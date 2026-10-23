/** Compara importes al centavo para evitar diferencias de coma flotante. */
export function coincidenSubtotalesCheckout(mostrado: number, vigente: number): boolean {
  if (!Number.isFinite(mostrado) || !Number.isFinite(vigente)) return false;
  return Math.round(mostrado * 100) === Math.round(vigente * 100);
}
