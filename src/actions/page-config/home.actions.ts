"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { PageConfig_featuredLayout } from "../../../generated/prisma/client";
import {
  obtenerCarpetaGrids,
  subirImagen,
  eliminarImagenes,
  obtenerPublicIdDesdeUrl,
} from "@/lib/services/cloudinary-service";

export interface UpdateConfigData {
  featuredLayout?: string;
}

interface GridItem {
  id?: string;
  title: string;
  subtitle: string;
  image: string;
  order: number;
  linkType:
  | "NONE"
  | "CATEGORY"
  | "PRODUCT"
  | "PAGE"
  | "EXTERNAL";
  linkValue?: string;
  subtitleNeon?: boolean;
  subtitleDim?: boolean;
  linkStyle?: "IMAGE" | "BUTTON";
  buttonVariant?: "DEFAULT" | "STRAIGHT" | "TRANSPARENT";
  buttonText?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

export async function updateSectionVisibility(data: UpdateConfigData) {
  try {
    await prisma.pageConfig.update({
      where: { id: 1 },
      data: {
        featuredLayout: data.featuredLayout
          ? (data.featuredLayout.toUpperCase() as PageConfig_featuredLayout)
          : undefined,
      },
    });

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Error al actualizar:", error);
    return { ok: false, error: "No se pudo actualizar la configuración" };
  }
}

export async function updateHomeGrids(
  homegridId: string | undefined | null,
  grids: GridItem[],
  title?: string
) {
  const publicIdsSubidos: string[] = [];
  try {
    let targetHomegridId = homegridId;

    if (!targetHomegridId) {
      const nuevoHomegrid = await prisma.homegrid.create({
        data: {
          title: title || "Home Destacado",
          subtitle: "",
          style: 1,
          columns: "md:grid-cols-2",
        },
      });

      await prisma.pageConfig.update({
        where: { id: 1 },
        data: { homegridId: nuevoHomegrid.id },
      });

      targetHomegridId = nuevoHomegrid.id;
    } else if (title) {
      await prisma.homegrid.update({
        where: { id: targetHomegridId },
        data: { title },
      });
    }

    const gridsExistentes = await prisma.grid.findMany({
      where: { homegridId: targetHomegridId },
    });

    let gridsProcesados: GridItem[] | null = null;
    try {
      gridsProcesados = await Promise.all(
        grids.map(async (g, indice) => {
          if (g.image.startsWith("data:image")) {
            const subida = await subirImagen(
              g.image,
              obtenerCarpetaGrids(targetHomegridId),
              `imagen-${Date.now()}-${indice + 1}`
            );
            publicIdsSubidos.push(subida.publicId);
            return { ...g, image: subida.url };
          }
          return g;
        })
      );
    } catch (error) {
      console.error("[CLOUDINARY][PAGE-CONFIG][HOME-GRIDS][SUBIDA]", error);
      await eliminarImagenes(publicIdsSubidos);
      return { ok: false, error: "No se pudieron actualizar las secciones" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.grid.deleteMany({ where: { homegridId: targetHomegridId } });

      await tx.grid.createMany({
        data: gridsProcesados!.map((g) => ({
          title: g.title,
          subtitle: g.subtitle,
          image: g.image,
          order: g.order || 0,
          linkType: g.linkType,
          linkValue: g.linkValue,
          subtitleNeon: g.subtitleNeon ?? false,
          subtitleDim: g.subtitleDim ?? false,
          linkStyle: g.linkStyle ?? "IMAGE",
          buttonVariant: g.buttonVariant ?? "DEFAULT",
          buttonText: g.buttonText || null,
          buttonBgColor: g.buttonBgColor || null,
          buttonTextColor: g.buttonTextColor || null,
          homegridId: targetHomegridId,
        })),
      });
    });

    const urlsFinales = new Set(
      gridsProcesados!.map((g) => g.image)
    );
    const publicIdsARemover = gridsExistentes
      .filter((grid) => !urlsFinales.has(grid.image))
      .map((grid) => obtenerPublicIdDesdeUrl(grid.image));

    await eliminarImagenes(publicIdsARemover);

    revalidatePath("/", "layout");
    return { ok: true, homegridId: targetHomegridId };
  } catch (error) {
    console.error("[CLOUDINARY][PAGE-CONFIG][HOME-GRIDS]", error);
    await eliminarImagenes(publicIdsSubidos);
    return { ok: false, error: "No se pudieron actualizar las secciones" };
  }
}