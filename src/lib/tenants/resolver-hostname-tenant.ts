import { normalizarHostname } from "./normalizar-hostname";

interface ConfiguracionPruebaDominio {
  enDesarrollo: boolean;
  hostnamePrueba?: string;
}

/** Selecciona un dominio registrado en Core al navegar desde localhost en desarrollo. */
export function resolverHostnameTenant(
  hostRecibido: string,
  configuracion: ConfiguracionPruebaDominio = {
    enDesarrollo: process.env.NODE_ENV === "development",
    hostnamePrueba: process.env.TENANT_TEST_HOSTNAME,
  },
): string | null {
  const hostname = normalizarHostname(hostRecibido);
  if (!hostname) return null;
  if (!configuracion.enDesarrollo || !configuracion.hostnamePrueba?.trim()) return hostname;
  if (hostname !== "localhost" && hostname !== "127.0.0.1" &&
      hostname !== "::1" && !hostname.endsWith(".localhost")) return hostname;

  const elegido = configuracion.hostnamePrueba.trim();
  if (/[:/,\\@\s]/.test(elegido)) return null;
  const normalizado = normalizarHostname(elegido);
  if (!normalizado || !normalizado.includes(".") || normalizado === "localhost" ||
      normalizado === "127.0.0.1" || normalizado === "::1") return null;
  return normalizado;
}
