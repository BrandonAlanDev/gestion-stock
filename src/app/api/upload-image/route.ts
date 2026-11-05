import { NextResponse } from "next/server";
import { subirImagen } from "@/lib/services/imagenes-cloudinary/subir-imagen";
import { obtenerCarpetaIdentidad } from "@/lib/services/imagenes-cloudinary/obtener-carpeta-identidad";
import { TAMANIO_MAXIMO_IMAGEN_BYTES, validarArchivoImagen } from "@/lib/services/imagenes-cloudinary/validar-archivo-imagen";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function POST(req: Request) {
  try {
    const { tenantId, tenantNombre } = await requiereAdmin();

    const limiteSolicitud = TAMANIO_MAXIMO_IMAGEN_BYTES + 64 * 1024;
    const longitud = Number(req.headers.get("content-length") ?? 0);
    if (longitud > limiteSolicitud) {
      return NextResponse.json({ error: "La imagen no puede superar los 5 MB" }, { status: 413 });
    }
    let cantidadRecibida = 0;
    const cuerpo = req.body?.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
      transform(bloque, controlador) {
        cantidadRecibida += bloque.byteLength;
        if (cantidadRecibida > limiteSolicitud) controlador.error(new Error("Solicitud demasiado grande"));
        else controlador.enqueue(bloque);
      },
    }));
    if (!cuerpo) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    let formData: FormData;
    try {
      formData = await new Response(cuerpo, {
        headers: { "Content-Type": req.headers.get("content-type") ?? "" },
      }).formData();
    } catch (error) {
      const excedido = error instanceof Error && error.message === "Solicitud demasiado grande";
      return NextResponse.json(
        { error: excedido ? "La imagen no puede superar los 5 MB" : "No se pudo leer la imagen" },
        { status: excedido ? 413 : 400 },
      );
    }

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

    try {
      await validarArchivoImagen(archivo);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Imagen no válida" },
        { status: 415 },
      );
    }

    const resultado = await subirImagen(
      archivo,
      obtenerCarpetaIdentidad(tenantId, tenantNombre),
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
