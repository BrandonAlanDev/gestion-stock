
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PageConfig_featuredLayout } from "../../../generated/prisma"; 
import cloudinary from "@/lib/cloudinary";

export interface UpdateConfigData {
  featuredLayout?: string;
}

interface GridItem {
  id?: string;
  title: string;
  subtitle: string;
  image: string;
  linkType:
  | "NONE"
  | "CATEGORY"
  | "PRODUCT"
  | "PAGE"
  | "EXTERNAL";
  linkValue?: string;
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
  grids: GridItem[]
) {
  try {
    const processedGrids = await Promise.all(
      grids.map(async (g) => {
        if (g.image.startsWith("data:image")) {
          const uploadResponse = await cloudinary.uploader.upload(g.image, {
            folder: "gestion-stock/home-grids",
          });
          return { ...g, image: uploadResponse.secure_url };
        }
        return g;
      })
    );

    const finalHomegridId = await prisma.$transaction(async (tx) => {
      let targetHomegridId = homegridId;

      if (!targetHomegridId) {
        const newHomegrid = await tx.homegrid.create({
          data: {
            title: "Home Destacado",      
            subtitle: "",
            style: 1,                    
            columns: "md:grid-cols-2",
          },
        });

        await tx.pageConfig.update({
          where: { id: 1 },
          data: { homegridId: newHomegrid.id },
        });

        targetHomegridId = newHomegrid.id;
      }

      await tx.grid.deleteMany({ where: { homegridId: targetHomegridId } });

      await tx.grid.createMany({
        data: processedGrids.map((g) => ({
          title: g.title,
          subtitle: g.subtitle,
          image: g.image,
          linkType: g.linkType,
          linkValue: g.linkValue,
          homegridId: targetHomegridId,
        })),
      });

      return targetHomegridId;
    });

    revalidatePath("/admin/pageConfig");
    return { ok: true, homegridId: finalHomegridId };
  } catch (error) {
    console.error("Error en updateHomeGrids:", error);
    return { ok: false, error: "No se pudieron actualizar las secciones" };
  }
}