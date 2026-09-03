export function afirmar(condicion: unknown, mensaje: string): asserts condicion {
  if (!condicion) {
    throw new Error(`Verificación fallida: ${mensaje}`);
  }
}
