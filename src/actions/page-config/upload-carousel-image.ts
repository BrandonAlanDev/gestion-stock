// src/actions/page-config/upload-carousel-image.ts
"use server";

import { auth } from "@/auth";
import { uploadImage } from "@/lib/upload-image";
export async function uploadCarouselImage(base64: string, publicId?: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  try {
    const result = await uploadImage({
      base64,
      folder: process.env.NAME_PROYECT_CLOUDINARY || "carrusel",
      publicId: publicId || undefined,
    });
    return { success: true, url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    return { error: "Error al subir imagen" };
  }
}