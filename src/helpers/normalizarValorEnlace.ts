const PREFIJOS_ENLACE = ["/productos?categoria=", "/productos/item/"];

export function normalizarValorEnlace(url: string): string {
  let valor = url.trim();
  let huboCambio = true;

  while (huboCambio) {
    huboCambio = false;

    for (const prefijo of PREFIJOS_ENLACE) {
      while (valor.startsWith(prefijo)) {
        valor = valor.slice(prefijo.length);
        huboCambio = true;
      }
    }

    if (!valor) break;

    try {
      const decodificado = decodeURIComponent(valor);
      if (decodificado !== valor) {
        valor = decodificado;
        huboCambio = true;
      }
    } catch {
      break;
    }
  }

  return valor;
}
