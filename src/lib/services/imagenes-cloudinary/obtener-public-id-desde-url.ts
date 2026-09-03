export function obtenerPublicIdDesdeUrl(url: string): string | null {
  try {
    const direccion = new URL(url);
    if (!direccion.hostname.endsWith("cloudinary.com")) return null;

    const segmentos = direccion.pathname.split("/").filter(Boolean);
    const indiceUpload = segmentos.indexOf("upload");
    if (indiceUpload === -1) return null;

    const resto = segmentos.slice(indiceUpload + 1);
    while (
      resto.length > 0 &&
      (resto[0].includes(",") || /^(v\d+|s--.*--|[a-z]_)/.test(resto[0]))
    ) {
      resto.shift();
    }
    if (resto.length === 0) return null;

    resto[resto.length - 1] = resto[resto.length - 1].replace(
      /\.(webp|png|jpe?g|gif|svg|avif|bmp|tiff?|ico|heic)$/i,
      ""
    );
    return resto.join("/");
  } catch {
    return null;
  }
}
