"use server";

import { auth } from "@/auth";
import { revalidateTag } from "next/cache";
import { serializeData } from "@/lib/utils";
import {
  carouselReorderSchema,
  carouselWizardSchema,
  carouselLimitsSchema,
  carouselWizardSlideSchema,
} from "@/lib/zod";
import * as carouselService from "@/lib/services/carousel-service";
import { uploadCarouselImage, deleteCarouselImage } from "./helpers";
import { extractPublicId } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

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
    return {
      ...d,
      settings: {
        ...s,
        slideLayout: s.slideLayout ?? oldLayout,
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

    const slidesWithImages = await Promise.all(
      parsed.data.slides.map(async (slide, index) => {
        let imageUrl = slide.image;
        if (imageUrl.startsWith("data:image")) {
          const uploaded = await uploadCarouselImage(imageUrl, "slide");
          imageUrl = uploaded.url;
        }
        return { ...slide, image: imageUrl, order: index };
      })
    );

    const carousel = await carouselService.createCarousel({
      type: parsed.data.type,
      title: parsed.data.title,
      active: true,
      order: nextOrder,
      settings: parsed.data.settings,
      slides: slidesWithImages,
    });

    revalidateTag("carousels");
    return { success: true, data: serializeData(carousel) };
  } catch (error: unknown) {
    if (error instanceof Error && (error as Record<string, unknown>).code === "P2002") {
      return { error: "Ya existe un carrusel con ese orden" };
    }
    console.error("Error creating carousel:", error);
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

    const slidesWithImages = await Promise.all(
      wizardData.slides.map(async (slide, index) => {
        let imageUrl = slide.image;
        if (imageUrl.startsWith("data:image")) {
          const uploaded = await uploadCarouselImage(imageUrl, "slide");
          imageUrl = uploaded.url;
        }
        return { ...slide, image: imageUrl, order: index };
      })
    );

    const carousel = await carouselService.updateCarousel({
      id,
      type: wizardData.type,
      title: wizardData.title,
      active: true,
      settings: wizardData.settings,
      slides: slidesWithImages,
    });

    revalidateTag("carousels");
    return { success: true, data: serializeData(carousel) };
  } catch (error) {
    console.error("Error updating carousel:", error);
    return { error: "Error al actualizar carrusel" };
  }
}

export async function deleteCarousel(id: string) {
  if (!(await requireAdmin())) return { error: "No autorizado" };
  try {
    const carousel = await carouselService.getCarouselById(id);
    if (carousel?.slides) {
      await Promise.all(
        carousel.slides.map(async (slide) => {
          if (slide.image) {
            const publicId = extractPublicId(slide.image);
            if (publicId) await deleteCarouselImage(publicId);
          }
        })
      );
    }
    await carouselService.deleteCarousel(id);

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

export async function addCarouselSlide(carouselId: string, slideData: unknown) {
  try {
    if (!(await requireAdmin())) return { error: "No autorizado" };
    const parsed = carouselWizardSlideSchema.safeParse(slideData);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    let imageUrl = parsed.data.image;
    if (imageUrl.startsWith("data:image")) {
      const uploaded = await uploadCarouselImage(imageUrl, "slide");
      imageUrl = uploaded.url;
    }

    const order = parsed.data.order ?? 0;
    const slide = await carouselService.createSlide({
      carouselId,
      image: imageUrl,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      description: parsed.data.description,
      ctaText: parsed.data.ctaText,
      url: parsed.data.url,
      config: parsed.data.config,
      order,
    });

    revalidateTag("carousels");
    return { success: true, data: serializeData(slide) };
  } catch (error: unknown) {
    console.error("Error adding slide:", error);
    return { error: "Error al agregar slide" };
  }
}

export async function updateCarouselSlide(slideId: string, slideData: unknown) {
  try {
    if (!(await requireAdmin())) return { error: "No autorizado" };
    const parsed = carouselWizardSlideSchema.safeParse(slideData);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    let imageUrl = parsed.data.image;
    if (imageUrl.startsWith("data:image")) {
      const uploaded = await uploadCarouselImage(imageUrl, "slide");
      imageUrl = uploaded.url;
    }

    const slide = await carouselService.updateSlide({
      id: slideId,
      image: imageUrl,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      description: parsed.data.description,
      ctaText: parsed.data.ctaText,
      url: parsed.data.url,
      config: parsed.data.config,
      order: parsed.data.order,
    });

    revalidateTag("carousels");
    return { success: true, data: serializeData(slide) };
  } catch (error: unknown) {
    console.error("Error updating slide:", error);
    return { error: "Error al actualizar slide" };
  }
}

export async function deleteCarouselSlide(slideId: string, carouselId: string) {
  try {
    if (!(await requireAdmin())) return { error: "No autorizado" };

    const slide = await carouselService.getSlideById(slideId);
    if (slide?.image) {
      const publicId = extractPublicId(slide.image);
      if (publicId) await deleteCarouselImage(publicId);
    }

    await carouselService.deleteSlide(slideId);

    const remaining = await carouselService.getSlidesByCarouselId(carouselId);
    await Promise.all(
      remaining.map((s, i) => carouselService.updateSlideOrder(s.id, i))
    );

    revalidateTag("carousels");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting slide:", error);
    return { error: "Error al eliminar slide" };
  }
}

