"use server";

import cloudinary from "@/lib/cloudinary";

const FOLDERS = {
  HERO: "gestion-stock/carousels/hero",
  BANNER: "gestion-stock/carousels/banner",
  CARDS: "gestion-stock/carousels/cards",
  slide: "gestion-stock/carousels/slides",
} as const;

type CarouselType = keyof typeof FOLDERS;

export async function uploadCarouselImage(base64: string, type: CarouselType = "slide") {
  const folder = FOLDERS[type] || FOLDERS.slide;
  const result = await cloudinary.uploader.upload(base64, {
    folder,
    format: "webp",
    transformation: [{ fetch_format: "auto", quality: "auto" }],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteCarouselImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
}