import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Archivo requerido" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "page-config",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      }
    );

    return NextResponse.json({
      url: result.secure_url,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error subiendo imagen" },
      { status: 500 }
    );
  }
}