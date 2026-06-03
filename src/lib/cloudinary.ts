// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// ⚠️ ASEGURATE DE QUE DIGA "export function" AQUÍ:
export function extractPublicId(url: string) {
  try {
    if (!url.includes("/upload/")) return null;
    
    const parts = url.split("/upload/")[1];
    const clean = parts.replace(/v\d+\//, "");
    return clean.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}