import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  subirImagen,
  obtenerCarpetaIdentidad,
} from "@/lib/services/cloudinary-service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

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
      obtenerCarpetaIdentidad()
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
