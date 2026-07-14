// src/actions/page-config/carousel-config.actions.ts
"use server";

import { revalidateTag } from "next/cache";
import { carouselConfigSchema } from "@/lib/zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function updateCarouselConfig(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const rawData = {
    carouselType: formData.get("carouselType"),
    carouselAutoplay: formData.get("carouselAutoplay") === "true",
    carouselInterval: parseInt(formData.get("carouselInterval") as string) || 6000,
  }; 

  const parsed = carouselConfigSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await prisma.pageConfig.update({
      where: { id: 1 },
      data: parsed.data,
    });
    revalidateTag("page-config");
    return { success: true };
  } catch (error) {
    return { error: "Error al actualizar la configuración del carrusel" };
  }
}