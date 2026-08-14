export function resolverEnlaceSlide(slide: {
  url?: string | null;
  config?: Record<string, unknown> | null;
}): string | null {
  const url = slide.url?.trim();
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  const linkType =
    typeof slide.config?.linkType === "string"
      ? slide.config.linkType.toUpperCase()
      : "";
  switch (linkType) {
    case "CATEGORY":
      return `/productos?categoria=${encodeURIComponent(url)}`;
    case "PRODUCT":
      return `/productos/item/${url}`;
    case "EXTERNAL":
      return url;
    default:
      return null;
  }
}
