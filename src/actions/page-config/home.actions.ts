"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { FeaturedLayout } from "../../../generated/prisma";
import cloudinary from "@/lib/cloudinary";

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

export async function updateHomeGrids(
  homegridId: string | undefined | null,
  grids: GridItem[]
) {
  try {
    // 1. Subir imágenes a Cloudinary si son data:image
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

    // 2. Usar una transacción para crear Homegrid si no existe
    const finalHomegridId = await prisma.$transaction(async (tx) => {
      let targetHomegridId = homegridId;

      // Si no hay homegridId, crear el Homegrid y asociarlo al PageConfig
      if (!targetHomegridId) {
        const newHomegrid = await tx.homegrid.create({
          data: {
            title: "Home Destacado",      // valores por defecto, se pueden personalizar
            subtitle: "",
            style: 1,                    // o el valor por defecto que quieras
            columns: "md:grid-cols-2",
          },
        });

        // Asociar el Homegrid al PageConfig con id = 1
        await tx.pageConfig.update({
          where: { id: 1 },
          data: { homegridId: newHomegrid.id },
        });

        targetHomegridId = newHomegrid.id;
      }

      // 3. Eliminar todos los grids existentes del Homegrid
      await tx.grid.deleteMany({ where: { homegridId: targetHomegridId } });

      // 4. Insertar los nuevos grids
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