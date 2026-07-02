"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { FeaturedLayout } from "../../../generated/prisma";
import {v2 as cloudinary} from "cloudinary";

interface UpdateConfigData {
  featuredLayout?: string;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface GridItem {
  id?: string;
  title: string;
  subtitle: string;
  image: string;
  url?: string;
}

export async function updateSectionVisibility(data: UpdateConfigData) {
  try {
    await prisma.pageConfig.update({
      where: { id: 1 },
      data: {
        featuredLayout: data.featuredLayout 
          ? (data.featuredLayout.toUpperCase() as FeaturedLayout) 
          : undefined,
      },
    });

    // Revalida la ruta raíz para que el componente padre reciba la nueva config
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Error al actualizar:", error);
    return { ok: false, error: "No se pudo actualizar la configuración" };
  }
}

export async function updateHomeGrids(homegridId: string, grids: GridItem[]) {
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

    await prisma.$transaction(async (tx) => {
      await tx.grid.deleteMany({ where: { homegridId: homegridId } });
      
      await tx.grid.createMany({
        data: processedGrids.map((g) => ({
          title: g.title,
          subtitle: g.subtitle,
          image: g.image,
          url: g.url || "",
          homegridId: homegridId,
        })),
      });
    });

    revalidatePath("/admin/pageConfig");
    return { ok: true };
  } catch (error) {
    console.error("Error en updateHomeGrids:", error);
    return { ok: false, error: "No se pudieron actualizar las secciones" };
  }
}