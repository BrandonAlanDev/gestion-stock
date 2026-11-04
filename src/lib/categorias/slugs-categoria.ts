export interface ElementoConSlug {
  id: string;
  name: string;
  slug?: string;
}

export function normalizarSlugCategoria(nombre: string): string {
  return nombre.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-AR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "categoria";
}

export function resolverElementoPorReferencia<T extends ElementoConSlug>(
  elementos: T[],
  referencia: string | null | undefined
): T | undefined {
  if (!referencia) return undefined;

  let valor = referencia.trim();
  try {
    valor = decodeURIComponent(valor).trim();
  } catch {
    // La referencia se compara tal como llegó si no tiene una codificación válida.
  }

  const minuscula = valor.toLocaleLowerCase("es-AR");
  return elementos.find((elemento) =>
    elemento.id === valor ||
    elemento.slug?.toLocaleLowerCase("es-AR") === minuscula ||
    elemento.name.trim().toLocaleLowerCase("es-AR") === minuscula ||
    normalizarSlugCategoria(elemento.name) === minuscula
  );
}

export function resolverSlugCategoria(
  referencia: string | null | undefined,
  categorias: ElementoConSlug[]
): string | null {
  return resolverElementoPorReferencia(categorias, referencia)?.slug ?? null;
}
