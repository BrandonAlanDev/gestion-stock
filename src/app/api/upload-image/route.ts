import { NextResponse } from "next/server";
import { subirImagen } from "@/lib/services/imagenes-cloudinary/subir-imagen";
import { obtenerCarpetaIdentidad } from "@/lib/services/imagenes-cloudinary/obtener-carpeta-identidad";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

const TIPOS_DE_IMAGEN_PERMITIDOS = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const TAMANIO_MAXIMO_IMAGEN_BYTES = 5 * 1024 * 1024;

function coincideConFirmaDeImagen(tipo: string, bytes: Uint8Array): boolean {
  if (tipo === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (tipo === "image/png") {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }

  if (tipo === "image/gif") {
    const cabecera = String.fromCharCode(...bytes.slice(0, 6));
    return cabecera === "GIF87a" || cabecera === "GIF89a";
  }

  if (tipo === "image/webp") {
    const cabeceraRiff = String.fromCharCode(...bytes.slice(0, 4));
    const tipoWebp = String.fromCharCode(...bytes.slice(8, 12));
    return cabeceraRiff === "RIFF" && tipoWebp === "WEBP";
  }

  return false;
}

export async function POST(req: Request) {
  try {
    const { tenantId } = await requiereAdmin();

    const formData = await req.formData();

    const archivo = formData.get("file");

    if (!(archivo instanceof File) || archivo.size === 0) {
      return NextResponse.json(
        { error: "Archivo requerido" },
        { status: 400 }
      );
    }

    if (archivo.size > TAMANIO_MAXIMO_IMAGEN_BYTES) {
      return NextResponse.json(
        { error: "La imagen no puede superar los 5 MB" },
        { status: 413 }
      );
    }

    if (!TIPOS_DE_IMAGEN_PERMITIDOS.has(archivo.type)) {
      return NextResponse.json(
        { error: "Formato de imagen no permitido" },
        { status: 415 }
      );
    }

    const bytes = await archivo.arrayBuffer();
    if (!coincideConFirmaDeImagen(archivo.type, new Uint8Array(bytes))) {
      return NextResponse.json(
        { error: "El contenido del archivo no coincide con una imagen válida" },
        { status: 415 }
      );
    }

    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${archivo.type};base64,${base64}`;

    const resultado = await subirImagen(
      dataUri,
      obtenerCarpetaIdentidad(tenantId),
      tenantId
    );

    return NextResponse.json({
      url: resultado.url,
      publicId: resultado.publicId,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "No autorizado") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    console.error("[CLOUDINARY][PAGE-CONFIG][UPLOAD]", error);

    return NextResponse.json(
      { error: "Error subiendo imagen" },
      { status: 500 }
    );
  }
}
