import { normalizarValorEnlace } from "@/lib/enlaces/normalizar-valor-enlace";
import { normalizarEnlaceNavegable } from "@/lib/enlaces/normalizar-enlace-navegable";

export function resolverEnlaceSlide(slide: {
  url?: string | null;
  config?: Record<string, unknown> | null;
}): string | null {
  const url = slide.url?.trim();
  if (!url) return null;
  if (url.startsWith("/productos?categoria=")) {
    const destino = normalizarValorEnlace(url);
    return destino ? `/productos?categoria=${encodeURIComponent(destino)}` : null;
  }
  if (url.startsWith("/productos/item/")) {
    const destino = normalizarValorEnlace(url);
    return destino ? `/productos/item/${destino}` : null;
  }
  const enlaceNavegable = normalizarEnlaceNavegable(url);
  if (enlaceNavegable) {
    return enlaceNavegable;
  }
  const linkType =
    typeof slide.config?.linkType === "string"
      ? slide.config.linkType.toUpperCase()
      : "";
  switch (linkType) {
    case "CATEGORY":
      return `/productos?categoria=${encodeURIComponent(normalizarValorEnlace(url))}`;
    case "PRODUCT":
      return `/productos/item/${normalizarValorEnlace(url)}`;
    case "EXTERNAL":
      return normalizarEnlaceNavegable(url);
    default:
      return null;
  }
}
