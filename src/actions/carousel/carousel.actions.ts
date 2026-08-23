"use server";

import { auth } from "@/auth";
import { revalidateTag, revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";
import {
  carouselReorderSchema,
  carouselWizardSchema,
} from "@/lib/zod";
import * as carouselService from "@/lib/services/carousel-service";
import {
  obtenerCarpetaCarrusel,
  subirImagen,
  eliminarImagenes,
  obtenerPublicIdDesdeUrl,
} from "@/lib/services/cloudinary-service";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";
import { procesarSlide } from "./procesar-slide";
import type { CarouselSettings, SlideConfig } from "@/types/carousel";

async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return false;
  return true;
}

function migrateSettings(data: unknown): unknown {
  if (typeof data !== "object" || data === null) return data;
  const d = data as Record<string, unknown>;
  if (!d.settings || typeof d.settings !== "object") return data;
  const s = d.settings as Record<string, unknown>;

  const oldLayout = s.layout;
  if (oldLayout === "grid" || oldLayout === "collage" || oldLayout === "minimal") {
    const layoutsValidos = ["standard", "split", "minimal"];
    const slideLayoutActual = typeof s.slideLayout === "string" ? s.slideLayout : "";
    return {
      ...d,
      settings: {
        ...s,
        slideLayout: layoutsValidos.includes(slideLayoutActual) ? slideLayoutActual : "standard",
        layout: "simple",
      },
    };
  }
  return data;
}

export async function createCarousel(data: unknown) {
  try {
    if (!(await requireAdmin())) return { error: "No autorizado" };
    const parsed = carouselWizardSchema.safeParse(migrateSettings(data));
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const limits = await carouselService.getCarouselLimits();
    const counts = await carouselService.countActiveCarouselsByType();
    if ((counts[parsed.data.type] || 0) >= limits[parsed.data.type]) {
      return { error: `Límite alcanzado: máx ${limits[parsed.data.type]} carrusel(es) ${parsed.data.type} activos` };
    }

    const maxOrderResult = await carouselService.getMaxOrder();
    const nextOrder = (maxOrderResult ?? -1) + 1;

    const carousel = await carouselService.createCarousel({
      type: parsed.data.type,
      title: parsed.data.title,
      active: true,
      order: nextOrder,
      settings: parsed.data.settings,
      slides: [],
    });

    const subidas: string[] = [];
    try {
      const slidesProcesados = [];
      for (let index = 0; index < parsed.data.slides.length; index++) {
        const procesado = await procesarSlide(parsed.data.slides[index], carousel.id);
        if (
          parsed.data.slides[index].image.startsWith("data:image") &&
          procesado.publicId
        ) {
          subidas.push(procesado.publicId);
        }
        slidesProcesados.push({ ...procesado, order: index });
      }

      await prisma.carouselSlide.createMany({
        data: slidesProcesados.map((slide) => ({
          carouselId: carousel.id,
          image: slide.image,
          publicId: slide.publicId,
          title: slide.title,
          subtitle: slide.subtitle,
          description: slide.description,
          ctaText: slide.ctaText,
          url: slide.url,
          config: slide.config as unknown as Prisma.InputJsonValue,
          order: slide.order,
        })),
      });
    } catch (error) {
      await eliminarImagenes(subidas);
      await carouselService.deleteCarousel(carousel.id);
      throw error;
    }

    revalidateTag("carousels");
    return { success: true, data: serializeData(carousel) };
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return { error: "Ya existe un carrusel con ese orden" };
    }
    console.error("Error creando carrusel:", error);
    return { error: "Error al crear carrusel" };
  }
}

export async function updateCarousel(data: unknown) {
  try {
    if (!(await requireAdmin())) return { error: "No autorizado" };

    const parsed = carouselWizardSchema.safeParse(migrateSettings(data));
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { id, ...wizardData } = parsed.data;
    if (!id) return { error: "ID de carrusel no proporcionado" };

    const existing = await carouselService.getCarouselById(id);
    if (!existing) return { error: "Carrusel no encontrado" };

    const publicIdPorImagen = new Map<string, string | null>();
    for (const slide of existing.slides ?? []) {
      publicIdPorImagen.set(slide.image ?? "", slide.publicId ?? null);
    }

    const subidasNuevas: string[] = [];
    const finalSlides = [];
    for (let index = 0; index < wizardData.slides.length; index++) {
      const slideDelWizard = wizardData.slides[index];
      const procesado = await procesarSlide(slideDelWizard, id);
      if (slideDelWizard.image.startsWith("data:image") && procesado.publicId) {
        subidasNuevas.push(procesado.publicId);
      }
      finalSlides.push({
        ...procesado,
        order: index,
        publicId: publicIdPorImagen.get(procesado.image) ?? procesado.publicId,
      });
    }

    let carousel;
    try {
      carousel = await carouselService.updateCarousel({
        id,
        type: wizardData.type,
        title: wizardData.title,
        active: existing.active,
        settings: wizardData.settings,
        slides: finalSlides,
      });
    } catch (error) {
      await eliminarImagenes(subidasNuevas);
      throw error;
    }

    const publicIdsFinales = new Set(
      finalSlides.map((s) => s.publicId ?? undefined).filter(Boolean)
    );
    const publicIdsViejos = (existing.slides ?? [])
      .map((s) => s.publicId ?? obtenerPublicIdDesdeUrl(s.image ?? ""))
      .filter((p): p is string => !!p && !publicIdsFinales.has(p));
    if (publicIdsViejos.length > 0) {
      await eliminarImagenes(publicIdsViejos);
    }

    revalidateTag("carousels");
    return { success: true, data: serializeData(carousel) };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return { error: "Ya existe un carrusel con ese orden" };
    }
    console.error("Error actualizando carrusel:", error);
    return { error: "Error al actualizar carrusel" };
  }
}

export async function deleteCarousel(id: string) {
  if (!(await requireAdmin())) return { error: "No autorizado" };
  try {
    const carousel = await carouselService.getCarouselById(id);
    if (!carousel) return { error: "Carrusel no encontrado" };

    await carouselService.deleteCarousel(id);

    const publicIds = (carousel.slides ?? []).map((slide) =>
      slide.publicId ?? obtenerPublicIdDesdeUrl(slide.image ?? "")
    );
    await eliminarImagenes(publicIds);

    const pageConfig = await prisma.pageConfig.findUnique({ where: { id: 1 } });
    if (pageConfig?.sectionOrder) {
      try {
        const sections = JSON.parse(pageConfig.sectionOrder) as string[];
        const filtered = sections.filter((s) => s !== `carousel_${id}`);
        if (filtered.length !== sections.length) {
          await prisma.pageConfig.update({
            where: { id: 1 },
            data: { sectionOrder: JSON.stringify(filtered) },
          });
        }
      } catch { }
    }

    revalidateTag("carousels");
    revalidateTag("page-config");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting carousel:", error);
    return { error: "Error al eliminar carrusel" };
  }
}

export async function reorderCarousels(data: unknown) {
  if (!(await requireAdmin())) return { error: "No autorizado" };
  const parsed = carouselReorderSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await carouselService.reorderCarousels(parsed.data.carouselIds);
    revalidateTag("carousels");
    return { success: true };
  } catch (error) {
    console.error("Error reordering carousels:", error);
    return { error: "Error al reordenar" };
  }
}

export async function getCarousels(type?: "HERO" | "BANNER" | "CARDS") {
  try {
    const carousels = await carouselService.getCarousels(type, true);
    return { success: true, data: serializeData(carousels) };
  } catch (error) {
    console.error("Error fetching carousels:", error);
    return { error: "Error al obtener carruseles" };
  }
}

export async function getAllCarousels() {
  try {
    const carousels = await carouselService.getCarousels(undefined, false);
    return { success: true, data: serializeData(carousels) };
  } catch (error) {
    console.error("Error al obtener todos los carruseles:", error);
    return { error: "Error al obtener carruseles" };
  }
}

export async function updateCarouselActive(id: string, active: boolean) {
  try {
    if (!(await requireAdmin())) return { error: "No autorizado" };
    const carousel = await carouselService.updateCarousel({ id, active });
    revalidateTag("carousels");
    revalidateTag("page-config");
    revalidatePath("/");
    return { success: true, data: serializeData(carousel) };
  } catch (error) {
    console.error("Error al actualizar el estado del carrusel:", error);
    return { error: "Error al actualizar el carrusel" };
  }
}

export async function duplicateCarousel(id: string) {
  try {
    if (!(await requireAdmin())) return { error: "No autorizado" };

    const original = await carouselService.getCarouselById(id);
    if (!original) return { error: "Carrusel no encontrado" };

    const limits = await carouselService.getCarouselLimits();
    const counts = await carouselService.countActiveCarouselsByType();
    if ((counts[original.type] || 0) >= limits[original.type]) {
      return { error: `Límite alcanzado: máx ${limits[original.type]} carrusel(es) ${original.type} activos` };
    }

    const maxOrderResult = await carouselService.getMaxOrder();
    const nextOrder = (maxOrderResult ?? -1) + 1;

    const copia = await carouselService.createCarousel({
      type: original.type,
      title: `${original.title ?? "Carrusel"} (copia)`,
      active: original.active,
      order: nextOrder,
      settings: (original.settings ?? undefined) as CarouselSettings | undefined,
      slides: [],
    });

    const subidas: string[] = [];
    try {
      const slides = [];
      for (let index = 0; index < (original.slides ?? []).length; index++) {
        const slideOriginal = original.slides?.[index];
        if (!slideOriginal) continue;
        let image = slideOriginal.image ?? "";
        let publicId: string | null | undefined;
        if (slideOriginal.publicId || obtenerPublicIdDesdeUrl(image)) {
          const subida = await subirImagen(image, obtenerCarpetaCarrusel(copia.id));
          image = subida.url;
          publicId = subida.publicId;
          subidas.push(subida.publicId);
        }
        slides.push({
          image,
          publicId,
          title: slideOriginal.title ?? undefined,
          subtitle: slideOriginal.subtitle ?? undefined,
          description: slideOriginal.description ?? undefined,
          ctaText: slideOriginal.ctaText ?? undefined,
          url: slideOriginal.url ?? undefined,
          config: (slideOriginal.config ?? undefined) as SlideConfig | undefined,
          order: index,
        });
      }

      await prisma.carouselSlide.createMany({
        data: slides.map((slide) => ({
          carouselId: copia.id,
          image: slide.image,
          publicId: slide.publicId,
          title: slide.title,
          subtitle: slide.subtitle,
          description: slide.description,
          ctaText: slide.ctaText,
          url: slide.url,
          config: slide.config as unknown as Prisma.InputJsonValue,
          order: slide.order,
        })),
      });
    } catch (error) {
      await eliminarImagenes(subidas);
      await carouselService.deleteCarousel(copia.id);
      throw error;
    }

    revalidateTag("carousels");
    return { success: true, data: serializeData(copia) };
  } catch (error) {
    console.error("Error al duplicar carrusel:", error);
    return { error: "Error al duplicar carrusel" };
  }
}

