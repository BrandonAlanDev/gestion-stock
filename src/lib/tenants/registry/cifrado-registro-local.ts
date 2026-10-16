import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const VERSION_CIFRADO = 1;
const TAMANIO_VECTOR = 12;

interface SobreCifrado {
  version: number;
  iv: string;
  etiqueta: string;
  contenido: string;
}

function obtenerClave(hexadecimal: string): Buffer {
  if (!/^[\da-f]{64}$/i.test(hexadecimal)) {
    throw new Error("TENANT_REGISTRY_ENCRYPTION_KEY debe contener 64 caracteres hexadecimales");
  }
  return Buffer.from(hexadecimal, "hex");
}

function interpretarSobre(valor: string): SobreCifrado {
  let sobre: unknown;
  try {
    sobre = JSON.parse(valor);
  } catch {
    throw new Error("El registro local cifrado no contiene JSON válido");
  }

  if (
    typeof sobre !== "object" ||
    sobre === null ||
    !("version" in sobre) ||
    !("iv" in sobre) ||
    !("etiqueta" in sobre) ||
    !("contenido" in sobre) ||
    typeof sobre.version !== "number" ||
    typeof sobre.iv !== "string" ||
    typeof sobre.etiqueta !== "string" ||
    typeof sobre.contenido !== "string"
  ) {
    throw new Error("El formato del registro local cifrado no es válido");
  }

  if (sobre.version !== VERSION_CIFRADO) {
    throw new Error("La versión del registro local cifrado no es compatible");
  }

  return sobre as SobreCifrado;
}

export function cifrarRegistroLocal(contenido: string, claveHexadecimal: string): string {
  const iv = randomBytes(TAMANIO_VECTOR);
  const cifrador = createCipheriv("aes-256-gcm", obtenerClave(claveHexadecimal), iv);
  const cifrado = Buffer.concat([
    cifrador.update(contenido, "utf8"),
    cifrador.final(),
  ]);

  return JSON.stringify({
    version: VERSION_CIFRADO,
    iv: iv.toString("base64url"),
    etiqueta: cifrador.getAuthTag().toString("base64url"),
    contenido: cifrado.toString("base64url"),
  } satisfies SobreCifrado);
}

export function descifrarRegistroLocal(sobreCifrado: string, claveHexadecimal: string): string {
  const sobre = interpretarSobre(sobreCifrado);
  const iv = Buffer.from(sobre.iv, "base64url");
  const etiqueta = Buffer.from(sobre.etiqueta, "base64url");
  const contenido = Buffer.from(sobre.contenido, "base64url");

  if (iv.length !== TAMANIO_VECTOR || etiqueta.length !== 16 || contenido.length === 0) {
    throw new Error("El registro local cifrado está incompleto o dañado");
  }

  try {
    const descifrador = createDecipheriv("aes-256-gcm", obtenerClave(claveHexadecimal), iv);
    descifrador.setAuthTag(etiqueta);
    return Buffer.concat([
      descifrador.update(contenido),
      descifrador.final(),
    ]).toString("utf8");
  } catch {
    throw new Error("No se pudo descifrar el registro local; verificá la clave y el archivo");
  }
}
