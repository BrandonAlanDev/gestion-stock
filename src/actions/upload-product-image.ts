"use server";

import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadProductImage(fileBase64: string): Promise<{ url: string; publicId: string }> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }

  if (!fileBase64 || !fileBase64.startsWith("data:image")) {
    throw new Error("Formato de archivo inválido");
  }

  // Validar tamaño máximo (opcional)
  const base64Length = fileBase64.length - fileBase64.indexOf(",") - 1;
  const sizeInBytes = (base64Length * 3) / 4; // aprox
  if (sizeInBytes > MAX_FILE_SIZE) {
    throw new Error(`La imagen supera los ${MAX_FILE_SIZE / 1024 / 1024} MB`);
  }

  // Validar tipo MIME desde el base64
  const mimeMatch = fileBase64.match(/^data:(image\/\w+);base64,/);
  if (!mimeMatch || !ALLOWED_TYPES.includes(mimeMatch[1])) {
    throw new Error("Tipo de imagen no permitido. Usá JPEG, PNG o WebP.");
  }

  try {
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: "gestion-stock/garments",
      format: "webp",
      transformation: [{ fetch_format: "auto", quality: "auto" }],
    });

    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error("Error al subir imagen a Cloudinary:", error);
    throw new Error("No se pudo subir la imagen al servidor");
  }
}