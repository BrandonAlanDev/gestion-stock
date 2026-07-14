// src/actions/page-config/carousel-slides.actions.ts
"use server";

import { revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import { bannerSchema } from "@/lib/zod";
import * as carouselService from "@/lib/services/carousel-service";
import { auth } from "@/auth";
import { CarouselType } from '../../../generated/prisma/client';

// Función cacheada para obtener los slides
const getCachedSlides = unstable_cache(
  async (pageConfigId: number) => {
    return carouselService.getBannersByPageConfig(pageConfigId);
  },
  ["carousel-slides"],
  { revalidate: 3600, tags: ["carousel-slides"] }
);

export async function getCarouselSlides(pageConfigId: number = 1) {
  return getCachedSlides(pageConfigId);
}

export async function createCarouselSlide(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const carouselType = formData.get("carouselType") as CarouselType;
  const data = {
    image: formData.get("image") as string,
    title: formData.get("title") as string | undefined,
    subtitle: formData.get("subtitle") as string | undefined,
    text: formData.get("text") as string | undefined,
    url: formData.get("url") as string | undefined,
    order: formData.get("order") ? parseInt(formData.get("order") as string) : undefined,
  };

  const schema = bannerSchema(carouselType);
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const slide = await carouselService.createBanner({
      pageConfigId: 1,
      ...parsed.data,
      order: parsed.data.order,
    });
    revalidateTag("carousel-slides");
    return { success: true, data: slide };
  } catch (error) {
    return { error: "Error al crear diapositiva" };
  }
}

export async function updateCarouselSlide(id: number, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const carouselType = formData.get("carouselType") as CarouselType;
  const data = {
    image: formData.get("image") as string | undefined,
    title: formData.get("title") as string | undefined,
    subtitle: formData.get("subtitle") as string | undefined,
    text: formData.get("text") as string | undefined,
    url: formData.get("url") as string | undefined,
    active: formData.get("active") === "true" ? true : formData.get("active") === "false" ? false : undefined,
  };

  const schema = bannerSchema(carouselType);
  const parsed = schema.partial().safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const updated = await carouselService.updateBanner(id, parsed.data);
    revalidateTag("carousel-slides");
    return { success: true, data: updated };
  } catch (error) {
    return { error: "Error al actualizar diapositiva" };
  }
}

export async function deleteCarouselSlide(id: number) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  try {
    await carouselService.deleteBanner(id);
    revalidateTag("carousel-slides");
    return { success: true };
  } catch (error) {
    return { error: "Error al eliminar diapositiva" };
  }
}

export async function reorderCarouselSlides(orderedIds: number[]) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  try {
    await carouselService.reorderBanners(1, orderedIds);
    revalidateTag("carousel-slides");
    return { success: true };
  } catch (error) {
    return { error: "Error al reordenar diapositivas" };
  }
}