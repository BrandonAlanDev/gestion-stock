import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// =====================================
// EXTRAER PUBLIC ID
// =====================================

export function extractPublicId(
  url: string
) {
  try {
    const parts =
      url.split("/upload/")[1];

    const clean =
      parts.replace(
        /v\d+\//,
        ""
      );

    return clean.replace(
      /\.[^/.]+$/,
      ""
    );
  } catch {
    return null;
  }
}