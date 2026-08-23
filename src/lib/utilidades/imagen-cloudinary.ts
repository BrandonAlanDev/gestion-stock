export function obtenerUrlImagenOptimizada(
  url: string | null | undefined,
  anchoMaximo = 600
): string | null {
  if (!url) return null;
  if (!url.includes("/upload/")) return url;
  const transformacion = `w_${anchoMaximo},q_auto,f_auto`;
  return url.replace("/upload/", `/upload/${transformacion}/`);
}
