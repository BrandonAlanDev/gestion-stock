const MAXIMO_LONGITUD_HOSTNAME = 253;

export function normalizarHostname(valor: string): string | null {
  // Host es un único valor. No se acepta la forma de lista usada por algunos
  // headers x-forwarded-* para impedir que un valor ambiguo elija un tenant.
  if (valor.includes(",")) return null;
  const valorRecibido = valor.trim().toLowerCase();
  if (!valorRecibido) return null;

  let hostname = valorRecibido;
  if (hostname.startsWith("[")) {
    const cierre = hostname.indexOf("]");
    if (cierre < 0) return null;

    const puerto = hostname.slice(cierre + 1);
    if (puerto && !puertoValido(puerto)) return null;
    hostname = hostname.slice(1, cierre);
  } else {
    const cantidadSeparadores = (hostname.match(/:/g) ?? []).length;
    if (cantidadSeparadores === 1) {
      const posicionPuerto = hostname.lastIndexOf(":");
      const puerto = hostname.slice(posicionPuerto + 1);
      if (!puertoValido(`:${puerto}`)) return null;
      hostname = hostname.slice(0, posicionPuerto);
    } else if (cantidadSeparadores > 1 && !/^[0-9a-f:]+$/i.test(hostname)) {
      return null;
    }
  }

  const hostnameSinPuntosFinales = hostname.replace(/\.+$/, "");
  const puntosFinales = hostname.length - hostnameSinPuntosFinales.length;
  if (puntosFinales > 1) return null;
  hostname = hostnameSinPuntosFinales;
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

function puertoValido(valor: string): boolean {
  if (!/^:\d{1,5}$/.test(valor)) return false;
  const puerto = Number(valor.slice(1));
  return puerto >= 1 && puerto <= 65535;
}
