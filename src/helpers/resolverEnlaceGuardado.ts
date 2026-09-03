import { normalizarValorEnlace } from "@/helpers/normalizarValorEnlace";

export function resolverEnlaceGuardado(
  linkType: string | undefined,
  url: string | undefined | null
): string {
  switch (linkType) {
    case "CATEGORY": {
      const destino = normalizarValorEnlace(url ?? "");
      return destino ? `/productos?categoria=${encodeURIComponent(destino)}` : "";
    }
    case "PRODUCT": {
      const destino = normalizarValorEnlace(url ?? "");
      return destino ? `/productos/item/${destino}` : "";
    }
    case "EXTERNAL":
      return (url ?? "").trim();
    default:
      return "";
  }
}
