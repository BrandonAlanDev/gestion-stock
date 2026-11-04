import type { CategoriaCatalogo } from "@/types/productos/catalogo-publico";
import { resolverElementoPorReferencia } from "@/lib/categorias/slugs-categoria";

export function normalizarEnlaceCategoriaPublico(
  url: string | null | undefined,
  tipoEnlace: string | null | undefined,
  categorias: CategoriaCatalogo[]
): string | null | undefined {
  const valor = url?.trim();
  const esEnlaceCategoria = tipoEnlace?.toUpperCase() === "CATEGORY" || valor?.startsWith("/productos?categoria=");
  if (!esEnlaceCategoria) return undefined;
  if (!valor) return null;

  let referenciaCategoria = valor;
  let referenciaSubcategoria: string | null = null;
  if (valor.startsWith("/productos?")) {
    const parametros = new URLSearchParams(valor.slice(valor.indexOf("?") + 1));
    referenciaCategoria = parametros.get("categoria") ?? "";
    referenciaSubcategoria = parametros.get("subcategoria");
  }

  const categoria = resolverElementoPorReferencia(categorias, referenciaCategoria);
  if (!categoria) return null;

  const parametros = new URLSearchParams({ categoria: categoria.slug });
  const subcategoria = resolverElementoPorReferencia(categoria.subCategories, referenciaSubcategoria);
  if (subcategoria) parametros.set("subcategoria", subcategoria.slug);
  return `/productos?${parametros.toString()}`;
}
