import type { MapaIds } from "./tipos-migracion";

export function reasignarEnlaceContenido(
  valor: string,
  mapas: MapaIds,
  tipo?: string,
  nombres: ReadonlyMap<string, ReadonlySet<string>> = new Map(),
): string {
  const enlace = valor.trim();
  if (!enlace || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(enlace)) return valor;
  const resolver = (tabla: string, anterior: string, admiteNombre = false): string => {
    const nuevo = mapas.get(tabla)?.get(anterior);
    if (nuevo !== undefined) return String(nuevo);
    if (admiteNombre && nombres.get(tabla)?.has(anterior.trim().toLowerCase())) return anterior;
    throw new Error(`Enlace de contenido apunta a un registro inexistente de ${tabla}.`);
  };
  if (enlace.startsWith("/")) {
    const url = new URL(enlace, "https://migracion.invalid");
    const producto = /^\/productos\/item\/([^/]+)\/?$/.exec(url.pathname);
    if (producto) {
      const nuevo = resolver("Garment", decodeURIComponent(producto[1]));
      url.pathname = `/productos/item/${encodeURIComponent(nuevo)}`;
    } else if (url.pathname === "/productos" || url.pathname === "/productos/") {
      for (const [parametro, tabla] of [["categoria", "Category"], ["subcategoria", "SubCategory"]]) {
        const anterior = url.searchParams.get(parametro);
        if (anterior) url.searchParams.set(parametro, resolver(tabla, anterior, true));
      }
    } else {
      return valor;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  }
  if (tipo === "CATEGORY") return resolver("Category", decodeURIComponent(enlace), true);
  if (tipo === "PRODUCT") return resolver("Garment", decodeURIComponent(enlace));
  return valor;
}
