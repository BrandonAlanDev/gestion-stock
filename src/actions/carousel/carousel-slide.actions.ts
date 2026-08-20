"use server";

import { auth } from "@/auth";
import { revalidateTag } from "next/cache";
import { serializeData } from "@/lib/utils";
import { carouselWizardSlideSchema } from "@/lib/zod";
import * as carouselService from "@/lib/services/carousel-service";
import {
  eliminarImagen,
  obtenerPublicIdDesdeUrl,
} from "@/lib/services/cloudinary-service";
import { procesarSlide } from "./procesar-slide";

async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return false;
  return true;
}

export async function addCarouselSlide(carouselId: string, slideData: unknown) {
  try {
    if (!(await requireAdmin())) return { error: "No autorizado" };
    const parsed = carouselWizardSlideSchema.safeParse(slideData);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const procesado = await procesarSlide(parsed.data, carouselId);

    let slide;
    try {
      slide = await carouselService.createSlide({
        carouselId,
        image: procesado.image,
        publicId: procesado.publicId,
        title: procesado.title,
        subtitle: procesado.subtitle,
        description: procesado.description,
        ctaText: procesado.ctaText,
        url: procesado.url,
        config: procesado.config,
        order: procesado.order,
      });
    } catch (error) {
      if (parsed.data.image.startsWith("data:image") && procesado.publicId) {
        await eliminarImagen(procesado.publicId);
      }
      throw error;
    }

    revalidateTag("carousels");
    return { success: true, data: serializeData(slide) };
  } catch (error: unknown) {
    console.error("Error agregando slide:", error);
    return { error: "Error al agregar slide" };
  }
}

export async function updateCarouselSlide(slideId: string, slideData: unknown) {
  try {
    if (!(await requireAdmin())) return { error: "No autorizado" };
    const parsed = carouselWizardSlideSchema.safeParse(slideData);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const slideActual = await carouselService.getSlideById(slideId);
    if (!slideActual) return { error: "Slide no encontrado" };

    const procesado = await procesarSlide(parsed.data, slideActual.carouselId);
    const hayImagenNueva = parsed.data.image.startsWith("data:image");
    const publicIdViejo = slideActual.publicId ?? obtenerPublicIdDesdeUrl(slideActual.image ?? "");

    let slide;
    try {
      slide = await carouselService.updateSlide({
        id: slideId,
        image: procesado.image,
        publicId: hayImagenNueva ? procesado.publicId : slideActual.publicId ?? procesado.publicId,
        title: procesado.title,
        subtitle: procesado.subtitle,
        description: procesado.description,
        ctaText: procesado.ctaText,
        url: procesado.url,
        config: procesado.config,
        order: procesado.order,
      });
    } catch (error) {
      if (hayImagenNueva && procesado.publicId) {
        await eliminarImagen(procesado.publicId);
      }
      throw error;
    }

    if (hayImagenNueva && publicIdViejo) {
      await eliminarImagen(publicIdViejo);
    }

    revalidateTag("carousels");
    return { success: true, data: serializeData(slide) };
  } catch (error: unknown) {
    console.error("Error actualizando slide:", error);
    return { error: "Error al actualizar slide" };
  }
}

export async function deleteCarouselSlide(slideId: string, carouselId: string) {
  try {
    if (!(await requireAdmin())) return { error: "No autorizado" };

    const slide = await carouselService.getSlideById(slideId);
    if (!slide) return { error: "Slide no encontrado" };

    await carouselService.deleteSlide(slideId);

    const publicId = slide.publicId ?? obtenerPublicIdDesdeUrl(slide.image ?? "");
    if (publicId) await eliminarImagen(publicId);

    const remaining = await carouselService.getSlidesByCarouselId(carouselId);
    await Promise.all(
      remaining.map((s, i) => carouselService.updateSlideOrder(s.id, i))
    );

    revalidateTag("carousels");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error eliminando slide:", error);
    return { error: "Error al eliminar slide" };
  }
}
