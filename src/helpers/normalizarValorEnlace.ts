const PREFIJOS_ENLACE = ["/productos?categoria=", "/productos/item/"];

export function normalizarValorEnlace(url: string): string {
  let valor = url.trim();
  let anterior = "";
  while (valor !== anterior) {
    anterior = valor;
    for (const prefijo of PREFIJOS_ENLACE) {
      while (valor.startsWith(prefijo)) {
        valor = valor.slice(prefijo.length);
      }
    }
    try {
      const decodificado = decodeURIComponent(valor);
      if (decodificado === valor) break;
      valor = decodificado;
    } catch {
      break;
    }
  }
  return valor;
}
