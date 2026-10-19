import "server-only";

import type { CredencialesBaseTenant } from "./types";

/** Convierte la URI cifrada de Core en opciones de conexión del cliente. */
export function analizarUriMysql(uri: string): CredencialesBaseTenant {
  let valor: URL;
  try { valor = new URL(uri); }
  catch { throw new Error("Core devolvió una URI de conexión inválida"); }
  const base = valor.pathname.slice(1);
  const puerto = valor.port ? Number(valor.port) : 3306;
  if (
    valor.protocol !== "mysql:" || !valor.hostname || !valor.username ||
    !base || base.includes("/") || valor.hash ||
    !Number.isInteger(puerto) || puerto < 1 || puerto > 65535
  ) throw new Error("Core devolvió una URI de conexión inválida");
  try {
    return {
      host: valor.hostname,
      puerto,
      usuario: decodeURIComponent(valor.username),
      contrasena: decodeURIComponent(valor.password),
      base: decodeURIComponent(base),
      ssl: true,
    };
  } catch {
    throw new Error("Core devolvió una URI de conexión inválida");
  }
}
