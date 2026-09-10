"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { PageConfig_featuredLayout } from "../../../generated/prisma/client";
import { obtenerCarpetaGrids } from "@/lib/services/imagenes-cloudinary/obtener-carpeta-grids";
import { subirImagen } from "@/lib/services/imagenes-cloudinary/subir-imagen";
import { eliminarImagenes } from "@/lib/services/imagenes-cloudinary/eliminar-imagenes";
import { obtenerPublicIdDesdeUrl } from "@/lib/services/imagenes-cloudinary/obtener-public-id-desde-url";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";

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
    const { pageConfig } = await requerirPageConfigAdministrador();
    await prisma.pageConfig.update({
      where: { id: pageConfig.id },
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
  let tenantId: string | null = null;
  try {
    const { contexto, pageConfig } = await requerirPageConfigAdministrador();
    tenantId = contexto.tenantId;
    const destinosPaginaValidos = grids.every((grid) =>
      grid.linkType !== "PAGE" || /^\/(?!\/)/.test(grid.linkValue?.trim() || "")
    );
    if (!destinosPaginaValidos) {
      return { ok: false, error: "Las páginas de destino deben comenzar con una sola barra (/)" };
    }

    let targetHomegridId = homegridId;

    if (!targetHomegridId) {
      const nuevoHomegrid = await prisma.homegrid.create({
        data: {
          tenantId: contexto.tenantId,
          title: title || "",
          subtitle: "",
          style: 1,
          columns: "md:grid-cols-2",
        },
      });

      await prisma.pageConfig.update({
        where: { id: pageConfig.id },
        data: { homegridId: nuevoHomegrid.id },
      });

      targetHomegridId = nuevoHomegrid.id;
    } else {
      const homegrid = await prisma.homegrid.findFirst({
        where: { id: targetHomegridId, tenantId: contexto.tenantId },
        select: { id: true },
      });
      if (!homegrid) throw new Error("La sección no pertenece a la tienda activa");
      if (title) {
        await prisma.homegrid.update({ where: { id: homegrid.id }, data: { title } });
      }
    }

    const gridsExistentes = await prisma.grid.findMany({
      where: { homegridId: targetHomegridId, tenantId: contexto.tenantId },
    });

    let gridsProcesados: GridItem[] | null = null;
    try {
      gridsProcesados = await Promise.all(
        grids.map(async (g, indice) => {
          if (g.image.startsWith("data:image")) {
            const subida = await subirImagen(
              g.image,
              obtenerCarpetaGrids(contexto.tenantId, targetHomegridId),
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
      await eliminarImagenes(publicIdsSubidos, contexto.tenantId);
      return { ok: false, error: "No se pudieron actualizar las secciones" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.grid.deleteMany({ where: { homegridId: targetHomegridId, tenantId: contexto.tenantId } });

      await tx.grid.createMany({
        data: gridsProcesados!.map((g) => ({
          tenantId: contexto.tenantId,
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

    await eliminarImagenes(publicIdsARemover, contexto.tenantId);

    revalidatePath("/", "layout");
    return { ok: true, homegridId: targetHomegridId };
  } catch (error) {
    console.error("[CLOUDINARY][PAGE-CONFIG][HOME-GRIDS]", error);
    if (tenantId && publicIdsSubidos.length > 0) {
      await eliminarImagenes(publicIdsSubidos, tenantId);
    }
    return { ok: false, error: "No se pudieron actualizar las secciones" };
  }
}
