"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";
import {
  carouselReorderSchema,
  carouselWizardSchema,
} from "@/lib/zod";
import { actualizarCarrusel } from "@/lib/services/carruseles/actualizar-carrusel";
import { contarCarruselesActivos } from "@/lib/services/carruseles/contar-carruseles-activos";
import { crearCarrusel as crearCarruselPersistido } from "@/lib/services/carruseles/crear-carrusel";
import { eliminarCarrusel as eliminarCarruselPersistido } from "@/lib/services/carruseles/eliminar-carrusel";
import { obtenerCarruselPorId } from "@/lib/services/carruseles/obtener-carrusel-por-id";
import { obtenerCarruseles as obtenerCarruselesPersistidos } from "@/lib/services/carruseles/obtener-carruseles";
import { obtenerLimitesCarrusel } from "@/lib/services/carruseles/obtener-limites-carrusel";
import { obtenerOrdenMaximo } from "@/lib/services/carruseles/obtener-orden-maximo";
import { reordenarCarruseles as reordenarCarruselesPersistidos } from "@/lib/services/carruseles/reordenar-carruseles";
import { obtenerCarpetaCarrusel } from "@/lib/services/imagenes-cloudinary/obtener-carpeta-carrusel";
import { subirImagen } from "@/lib/services/imagenes-cloudinary/subir-imagen";
import { eliminarImagenes } from "@/lib/services/imagenes-cloudinary/eliminar-imagenes";
import { obtenerPublicIdDesdeUrl } from "@/lib/services/imagenes-cloudinary/obtener-public-id-desde-url";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";
import { procesarSlide } from "./procesar-slide";
import type { CarouselSettings, SlideConfig } from "@/types/carousel";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { getOrCreatePageConfig } from "@/actions/page-config/shared/get-page-config";

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
    const { tenantId } = await requiereAdmin();
    const parsed = carouselWizardSchema.safeParse(migrateSettings(data));
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const limits = await obtenerLimitesCarrusel();
    const counts = await contarCarruselesActivos(tenantId);
    if ((counts[parsed.data.type] || 0) >= limits[parsed.data.type]) {
      return { error: `Límite alcanzado: máx ${limits[parsed.data.type]} carrusel(es) ${parsed.data.type} activos` };
    }

    const maxOrderResult = await obtenerOrdenMaximo(tenantId);
    const nextOrder = (maxOrderResult ?? -1) + 1;

    const carousel = await crearCarruselPersistido(tenantId, {
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
        const procesado = await procesarSlide(parsed.data.slides[index], tenantId, carousel.id);
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
          tenantId,
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
      await eliminarImagenes(subidas, tenantId);
      await eliminarCarruselPersistido(tenantId, carousel.id);
      throw error;
    }

    revalidateTag(`tenant:${tenantId}:carousels`);
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
    const { tenantId } = await requiereAdmin();

    const parsed = carouselWizardSchema.safeParse(migrateSettings(data));
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { id, ...wizardData } = parsed.data;
    if (!id) return { error: "ID de carrusel no proporcionado" };

    const existing = await obtenerCarruselPorId(tenantId, id);
    if (!existing) return { error: "Carrusel no encontrado" };

    const publicIdPorImagen = new Map<string, string | null>();
    for (const slide of existing.slides ?? []) {
      publicIdPorImagen.set(slide.image ?? "", slide.publicId ?? null);
    }

    const subidasNuevas: string[] = [];
    const finalSlides = [];
    for (let index = 0; index < wizardData.slides.length; index++) {
      const slideDelWizard = wizardData.slides[index];
      const procesado = await procesarSlide(slideDelWizard, tenantId, id);
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
      carousel = await actualizarCarrusel(tenantId, {
        id,
        type: wizardData.type,
        title: wizardData.title,
        active: existing.active,
        settings: wizardData.settings,
        slides: finalSlides,
      });
    } catch (error) {
      await eliminarImagenes(subidasNuevas, tenantId);
      throw error;
    }

    const publicIdsFinales = new Set(
      finalSlides.map((s) => s.publicId ?? undefined).filter(Boolean)
    );
    const publicIdsViejos = (existing.slides ?? [])
      .map((s) => s.publicId ?? obtenerPublicIdDesdeUrl(s.image ?? ""))
      .filter((p): p is string => !!p && !publicIdsFinales.has(p));
    if (publicIdsViejos.length > 0) {
      await eliminarImagenes(publicIdsViejos, tenantId);
    }

    revalidateTag(`tenant:${tenantId}:carousels`);
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
  try {
    const { tenantId } = await requiereAdmin();
    const carousel = await obtenerCarruselPorId(tenantId, id);
    if (!carousel) return { error: "Carrusel no encontrado" };

    await eliminarCarruselPersistido(tenantId, id);

    const publicIds = (carousel.slides ?? []).map((slide) =>
      slide.publicId ?? obtenerPublicIdDesdeUrl(slide.image ?? "")
    );
    await eliminarImagenes(publicIds, tenantId);

    const pageConfig = await getOrCreatePageConfig(tenantId);
    if (pageConfig?.sectionOrder) {
      try {
        const sections = JSON.parse(pageConfig.sectionOrder) as string[];
        const filtered = sections.filter((s) => s !== `carousel_${id}`);
        if (filtered.length !== sections.length) {
          await prisma.pageConfig.update({
            where: { id: pageConfig.id },
            data: { sectionOrder: JSON.stringify(filtered) },
          });
        }
      } catch { }
    }

    revalidateTag(`tenant:${tenantId}:carousels`);
    revalidateTag(`page-config:${tenantId}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting carousel:", error);
    return { error: "Error al eliminar carrusel" };
  }
}

export async function reorderCarousels(data: unknown) {
  const parsed = carouselReorderSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const { tenantId } = await requiereAdmin();
    await reordenarCarruselesPersistidos(tenantId, parsed.data.carouselIds);
    revalidateTag(`tenant:${tenantId}:carousels`);
    return { success: true };
  } catch (error) {
    console.error("Error reordering carousels:", error);
    return { error: "Error al reordenar" };
  }
}

export async function getCarousels(type?: "HERO" | "BANNER" | "CARDS") {
  try {
    const { id: tenantId } = await requiereTenantActivo();
    const carousels = await obtenerCarruselesPersistidos(tenantId, type, true);
    return { success: true, data: serializeData(carousels) };
  } catch (error) {
    console.error("Error fetching carousels:", error);
    return { error: "Error al obtener carruseles" };
  }
}

export async function getAllCarousels() {
  try {
    const { tenantId } = await requiereAdmin();
    const carousels = await obtenerCarruselesPersistidos(tenantId, undefined, false);
    return { success: true, data: serializeData(carousels) };
  } catch (error) {
    console.error("Error al obtener todos los carruseles:", error);
    return { error: "Error al obtener carruseles" };
  }
}

export async function updateCarouselActive(id: string, active: boolean) {
  try {
    const { tenantId } = await requiereAdmin();
    const carousel = await actualizarCarrusel(tenantId, { id, active });
    revalidateTag(`tenant:${tenantId}:carousels`);
    revalidateTag(`page-config:${tenantId}`);
    revalidatePath("/");
    return { success: true, data: serializeData(carousel) };
  } catch (error) {
    console.error("Error al actualizar el estado del carrusel:", error);
    return { error: "Error al actualizar el carrusel" };
  }
}

export async function duplicateCarousel(id: string) {
  try {
    const { tenantId } = await requiereAdmin();

    const original = await obtenerCarruselPorId(tenantId, id);
    if (!original) return { error: "Carrusel no encontrado" };

    const limits = await obtenerLimitesCarrusel();
    const counts = await contarCarruselesActivos(tenantId);
    if ((counts[original.type] || 0) >= limits[original.type]) {
      return { error: `Límite alcanzado: máx ${limits[original.type]} carrusel(es) ${original.type} activos` };
    }

    const maxOrderResult = await obtenerOrdenMaximo(tenantId);
    const nextOrder = (maxOrderResult ?? -1) + 1;

    const copia = await crearCarruselPersistido(tenantId, {
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
          const subida = await subirImagen(image, obtenerCarpetaCarrusel(tenantId, copia.id));
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
          tenantId,
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
      await eliminarImagenes(subidas, tenantId);
      await eliminarCarruselPersistido(tenantId, copia.id);
      throw error;
    }

    revalidateTag(`tenant:${tenantId}:carousels`);
    return { success: true, data: serializeData(copia) };
  } catch (error) {
    console.error("Error al duplicar carrusel:", error);
    return { error: "Error al duplicar carrusel" };
  }
}

