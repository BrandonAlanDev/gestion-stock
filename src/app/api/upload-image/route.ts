import { NextResponse } from "next/server";
import { subirImagen } from "@/lib/services/imagenes-cloudinary/subir-imagen";
import { obtenerCarpetaIdentidad } from "@/lib/services/imagenes-cloudinary/obtener-carpeta-identidad";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function POST(req: Request) {
  try {
    const { tenantId } = await requiereAdmin();

    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Archivo requerido" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${file.type || "image/png"};base64,${base64}`;

    const resultado = await subirImagen(
      dataUri,
      obtenerCarpetaIdentidad(tenantId)
    );

    return NextResponse.json({
      url: resultado.url,
      publicId: resultado.publicId,
    });
  } catch (error) {
    console.error("[CLOUDINARY][PAGE-CONFIG][UPLOAD]", error);

    return NextResponse.json(
      { error: "Error subiendo imagen" },
      { status: 500 }
    );
  }
}
