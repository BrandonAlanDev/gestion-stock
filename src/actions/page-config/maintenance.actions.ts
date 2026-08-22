"use server";

import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { revalidateTag } from "next/cache";
import { extractPublicId } from "@/lib/utils";
import { RESET_DATA } from "@/actions/page-config/shared/reset-data"

export async function clearPageConfig() {
  try {
    const existing =
      await prisma.pageConfig.findUnique({
        where: { id: 1 },
      });

    if (!existing) {
      return {
        ok: false,
        error:
          "No existe configuración",
      };
    }

    const images = [
      existing.logo,
      existing.banner,
      existing.favicon,
    ];

    for (const image of images) {
      if (!image) continue;

      const publicId =
        extractPublicId(image);

      if (publicId) {
        await cloudinary.uploader.destroy(
          publicId
        );
      }
    }

    const pageConfig =
      await prisma.pageConfig.update({
        where: { id: 1 },

        data: RESET_DATA,
      });

    revalidateTag("page-config");
    revalidateTag("branding-config");

    return { ok: true, pageConfig };
  } catch {
    return { ok: false, error: "Error al limpiar configuración" };
  }
}