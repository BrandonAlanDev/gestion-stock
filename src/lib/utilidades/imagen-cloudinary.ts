export function obtenerUrlImagenOptimizada(
  url: string | null | undefined,
  anchoMaximo = 1200
): string | null {
  if (!url) return null;
  if (!url.includes("/upload/")) return url;
  const transformacion = `w_${anchoMaximo},q_auto:good,f_auto`;
  return url.replace("/upload/", `/upload/${transformacion}/`);
}
