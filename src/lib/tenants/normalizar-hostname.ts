const MAXIMO_LONGITUD_HOSTNAME = 253;

export function normalizarHostname(valor: string): string | null {
  const valorRecibido = valor.split(",")[0]?.trim().toLowerCase() ?? "";
  if (!valorRecibido) return null;

  let hostname = valorRecibido;
  if (hostname.startsWith("[")) {
    const cierre = hostname.indexOf("]");
    if (cierre < 0) return null;

    const puerto = hostname.slice(cierre + 1);
    if (puerto && !/^:\d+$/.test(puerto)) return null;
    hostname = hostname.slice(1, cierre);
  } else {
    const cantidadSeparadores = (hostname.match(/:/g) ?? []).length;
    if (cantidadSeparadores === 1) {
      const posicionPuerto = hostname.lastIndexOf(":");
      const puerto = hostname.slice(posicionPuerto + 1);
      if (!/^\d+$/.test(puerto)) return null;
      hostname = hostname.slice(0, posicionPuerto);
    } else if (cantidadSeparadores > 1 && !/^[0-9a-f:]+$/i.test(hostname)) {
      return null;
    }
  }

  hostname = hostname.replace(/\.+$/, "");
  if (!hostname || hostname.length > MAXIMO_LONGITUD_HOSTNAME) return null;
  if (hostname === "::1") return hostname;
  if (!/^[a-z0-9.-]+$/.test(hostname)) return null;

  const etiquetas = hostname.split(".");
  const etiquetasValidas = etiquetas.every(
    (etiqueta) =>
      etiqueta.length > 0 &&
      etiqueta.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(etiqueta),
  );

  return etiquetasValidas ? hostname : null;
}
