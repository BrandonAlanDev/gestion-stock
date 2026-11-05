export const TAMANIO_MAXIMO_IMAGEN_BYTES = 5 * 1024 * 1024;

const TIPOS_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function texto(bytes: Uint8Array, inicio: number, fin: number): string {
  return String.fromCharCode(...bytes.subarray(inicio, fin));
}

function detectarTipo(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((valor, indice) => bytes[indice] === valor)) {
    return "image/png";
  }
  if (texto(bytes, 0, 6) === "GIF87a" || texto(bytes, 0, 6) === "GIF89a") return "image/gif";
  if (texto(bytes, 0, 4) === "RIFF" && texto(bytes, 8, 12) === "WEBP" &&
    ["VP8 ", "VP8L", "VP8X"].includes(texto(bytes, 12, 16))) return "image/webp";
  return null;
}

export async function validarArchivoImagen(archivo: File): Promise<void> {
  if (!TIPOS_PERMITIDOS.has(archivo.type)) {
    throw new Error("Formato no válido. Usá JPG, PNG, WebP o GIF.");
  }
  if (!archivo.size || archivo.size > TAMANIO_MAXIMO_IMAGEN_BYTES) {
    throw new Error("Cada imagen puede pesar hasta 5 MB.");
  }
  const cabecera = new Uint8Array(await archivo.slice(0, 16).arrayBuffer());
  if (detectarTipo(cabecera) !== archivo.type) {
    throw new Error("El contenido del archivo no coincide con una imagen válida.");
  }
}
