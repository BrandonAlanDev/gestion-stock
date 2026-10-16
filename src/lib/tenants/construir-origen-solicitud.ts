import { normalizarHostname } from "./normalizar-hostname";

/** Construye el origen público desde Host validado, conservando puertos locales. */
export function construirOrigenSolicitud(
  hostRecibido: string,
  produccion: boolean,
): string | null {
  if (/[,/\\@\s]/.test(hostRecibido)) return null;

  const hostname = normalizarHostname(hostRecibido);
  if (!hostname) return null;

  const protocolo = produccion ? "https" : "http";
  let origenRecibido: URL;
  try {
    origenRecibido = new URL(`${protocolo}://${hostRecibido}`);
  } catch {
    return null;
  }

  const hostnameUrl = origenRecibido.hostname.startsWith("[") &&
    origenRecibido.hostname.endsWith("]")
    ? origenRecibido.hostname.slice(1, -1)
    : origenRecibido.hostname;
  if (normalizarHostname(hostnameUrl) !== hostname) return null;
  if (produccion && origenRecibido.port) return null;

  const hostnameCanonico = hostname.includes(":") ? `[${hostname}]` : hostname;
  const puerto = origenRecibido.port ? `:${origenRecibido.port}` : "";
  return new URL(`${protocolo}://${hostnameCanonico}${puerto}`).origin;
}
