"use server";

import cloudinary from "@/lib/cloudinary";
import { extractPublicId } from "@/lib/cloudinary";

export async function uploadPageImage(
  image: string | null | undefined,
  oldImage: string | null | undefined,
  folder: string
) {
  if (!image) return null;

  if (!image.startsWith("data:image")) {
    return image;
  }

  if (oldImage) {
    const publicId =
      extractPublicId(oldImage);

    if (publicId) {
      await cloudinary.uploader.destroy(
        publicId
      );
    }
  }

  const upload =
    await cloudinary.uploader.upload(
      image,
      { folder }
    );

  return upload.secure_url;
}