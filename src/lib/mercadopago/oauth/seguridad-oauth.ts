import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";
import { normalizarHostname } from "../../tenants/normalizar-hostname";

const DURACION_ESTADO_MS = 10 * 60 * 1000;
const TOLERANCIA_RELOJ_MS = 30 * 1000;
const CONTEXTO_CLAVE = "gestion-stock:mercadopago:oauth-state:v1";

export interface EstadoOAuthVerificado {
  hostname: string;
  origen: string;
  emitidoEn: number;
  expiraEn: number;
}

/** Cifra y autentica el origen de retorno durante diez minutos. */
export function firmarEstadoOAuth(
  hostname: string,
  origen: string,
  secreto: string,
  ahora = Date.now(),
): string {
  const hostNormalizado = normalizarHostname(hostname);
  if (
    !hostNormalizado || !validarOrigen(origen, hostNormalizado) || !secreto
  ) {
    throw new Error("No se puede firmar un estado OAuth inválido");
  }

  const contenido: EstadoOAuthVerificado = {
    hostname: hostNormalizado,
    origen,
    emitidoEn: ahora,
    expiraEn: ahora + DURACION_ESTADO_MS,
  };
  const iv = randomBytes(12);
  const cifrador = createCipheriv("aes-256-gcm", derivarClave(secreto), iv);
  const cifrado = Buffer.concat([
    cifrador.update(JSON.stringify(contenido), "utf8"),
    cifrador.final(),
  ]);
  const etiqueta = cifrador.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    etiqueta.toString("base64url"),
    cifrado.toString("base64url"),
  ].join(".");
}

/** Descifra y verifica el estado OAuth, incluidos su origen firmado y su vigencia. */
export function leerEstadoOAuth(
  estadoFirmado: string,
  secreto: string,
  ahora = Date.now(),
): EstadoOAuthVerificado | null {
  try {
    if (estadoFirmado.length > 4096 || !secreto) return null;
    const partes = estadoFirmado.split(".");
    if (
      partes.length !== 4 || partes[0] !== "v1" ||
      !partes.slice(1).every((parte) => /^[A-Za-z0-9_-]+$/.test(parte))
    ) return null;

    const iv = Buffer.from(partes[1]!, "base64url");
    const etiqueta = Buffer.from(partes[2]!, "base64url");
    const cifrado = Buffer.from(partes[3]!, "base64url");
    if (iv.length !== 12 || etiqueta.length !== 16 || cifrado.length === 0) return null;

    const descifrador = createDecipheriv("aes-256-gcm", derivarClave(secreto), iv);
    descifrador.setAuthTag(etiqueta);
    const texto = Buffer.concat([
      descifrador.update(cifrado),
      descifrador.final(),
    ]).toString("utf8");
    const valor: unknown = JSON.parse(texto);
    if (typeof valor !== "object" || valor === null || Array.isArray(valor)) return null;
    const registro = valor as Record<string, unknown>;
    const hostname = typeof registro.hostname === "string"
      ? normalizarHostname(registro.hostname)
      : null;
    if (
      hostname !== null && hostname === registro.hostname &&
      typeof registro.origen === "string" &&
      validarOrigen(registro.origen, hostname) &&
      Number.isSafeInteger(registro.emitidoEn) &&
      Number.isSafeInteger(registro.expiraEn)
    ) {
      const emitidoEn = registro.emitidoEn as number;
      const expiraEn = registro.expiraEn as number;
      if (
        emitidoEn <= ahora + TOLERANCIA_RELOJ_MS &&
        ahora - emitidoEn <= DURACION_ESTADO_MS + TOLERANCIA_RELOJ_MS &&
        expiraEn > ahora &&
        expiraEn > emitidoEn &&
        expiraEn - emitidoEn <= DURACION_ESTADO_MS
      ) {
        return {
          hostname,
          origen: registro.origen,
          emitidoEn,
          expiraEn,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Comprueba el origen si el proveedor devuelve el callback al dominio de la tienda. */
export function verificarEstadoOAuth(
  estadoFirmado: string,
  hostRecibido: string,
  secreto: string,
  ahora = Date.now(),
): boolean {
  const estado = leerEstadoOAuth(estadoFirmado, secreto, ahora);
  const hostname = normalizarHostname(hostRecibido);
  const origen = construirOrigenHost(hostRecibido);
  return Boolean(
    estado &&
    estado.hostname === hostname &&
    estado.origen === origen,
  );
}

/** Valida un origen serializado antes de usarlo como destino de redirección. */
export function validarOrigenOAuth(origen: string, hostname: string): boolean {
  return validarOrigen(origen, normalizarHostname(hostname));
}

export function generarVerificadorPKCE(): string {
  return randomBytes(64).toString("base64url");
}

export function generarDesafioPKCE(verificador: string): string {
  return createHash("sha256").update(verificador).digest("base64url");
}

function derivarClave(secreto: string): Buffer {
  return createHmac("sha256", secreto).update(CONTEXTO_CLAVE).digest();
}

function validarOrigen(origen: string, hostname: string | null): boolean {
  if (!hostname || origen.length > 512) return false;
  try {
    const url = new URL(origen);
    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      url.username || url.password || url.pathname !== "/" || url.search || url.hash ||
      url.origin !== origen ||
      normalizarHostname(url.hostname) !== hostname
    ) return false;
    if (process.env.NODE_ENV === "production" && (url.protocol !== "https:" || url.port)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function construirOrigenHost(host: string): string | null {
  const hostname = normalizarHostname(host);
  if (!hostname) return null;
  const protocolo = process.env.NODE_ENV === "production" ? "https:" : "http:";
  try {
    const url = new URL(`${protocolo}//${host}`);
    const hostnameUrl = normalizarHostname(url.hostname);
    if (hostnameUrl !== hostname || (process.env.NODE_ENV === "production" && url.port)) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}
