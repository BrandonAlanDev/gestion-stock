/** Obtiene un único puerto efímero publicado en IPv4 loopback por Docker Compose. */
export function obtenerPuertoPublicadoLoopback(salida: string): number {
  const lineas = salida.split(/\r?\n/).map((linea) => linea.trim()).filter(Boolean);
  if (lineas.length !== 1) {
    throw new Error("Docker Compose no devolvió una única publicación de puerto");
  }

  const coincidencia = /^127\.0\.0\.1:(\d{1,5})$/.exec(lineas[0] ?? "");
  const puerto = Number(coincidencia?.[1]);
  if (!coincidencia || !Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error("Docker Compose debe publicar MySQL únicamente en IPv4 loopback con un puerto válido");
  }
  return puerto;
}
