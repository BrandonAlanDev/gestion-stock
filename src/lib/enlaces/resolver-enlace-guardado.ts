import { normalizarValorEnlace } from "@/lib/enlaces/normalizar-valor-enlace";
import { normalizarEnlaceNavegable } from "@/lib/enlaces/normalizar-enlace-navegable";

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
      return normalizarEnlaceNavegable(url) ?? "";
    default:
      return "";
  }
}
