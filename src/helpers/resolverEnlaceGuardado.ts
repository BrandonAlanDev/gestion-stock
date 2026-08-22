export function resolverEnlaceGuardado(
  linkType: string | undefined,
  url: string | undefined | null
): string {
  const destino = (url ?? "").trim();
  switch (linkType) {
    case "CATEGORY":
      return destino ? `/productos?categoria=${encodeURIComponent(destino)}` : "";
    case "PRODUCT":
      return destino ? `/productos/item/${destino}` : "";
    case "EXTERNAL":
      return destino;
    default:
      return "";
  }
}
