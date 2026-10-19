"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { obtenerCarpetaGrids } from "@/lib/services/imagenes-cloudinary/obtener-carpeta-grids";
import { subirImagen } from "@/lib/services/imagenes-cloudinary/subir-imagen";
import { eliminarImagenes } from "@/lib/services/imagenes-cloudinary/eliminar-imagenes";
import { obtenerPublicIdDesdeUrl } from "@/lib/services/imagenes-cloudinary/obtener-public-id-desde-url";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { conPrisma } from "@/lib/prisma";

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
      const nuevoHomegrid = await conPrisma((prisma) =>
        prisma.$transaction(async (tx) => {
          const homegrid = await tx.homegrid.create({
            data: {
              title: title || "",
              subtitle: "",
              style: 1,
              columns: "md:grid-cols-2",
            },
          });
          await tx.pageConfig.update({
            where: { id: pageConfig.id },
            data: { homegridId: homegrid.id },
          });
          return homegrid;
        }),
      );

      targetHomegridId = nuevoHomegrid.id;
    } else {
      const homegridIdActual = targetHomegridId;
      await conPrisma(async (prisma) => {
        const homegrid = await prisma.homegrid.findFirst({
          where: { id: homegridIdActual },
          select: { id: true },
        });
        if (!homegrid) throw new Error("La sección no pertenece a la tienda activa");
        if (title) {
          await prisma.homegrid.update({
            where: { id: homegrid.id },
            data: { title },
          });
        }
      });
    }

    const gridsExistentes = await conPrisma((prisma) =>
      prisma.grid.findMany({
        where: { homegridId: targetHomegridId },
      }),
    );

    let gridsProcesados: GridItem[] | null = null;
    try {
      gridsProcesados = await Promise.all(
        grids.map(async (g, indice) => {
          if (g.image.startsWith("data:image")) {
            const subida = await subirImagen(
              g.image,
              obtenerCarpetaGrids(contexto.tenantId, targetHomegridId),
              contexto.tenantId,
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

    await conPrisma((prisma) => prisma.$transaction(async (tx) => {
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
    }));

    const urlsFinales = new Set(
      gridsProcesados!.map((g) => g.image)
    );
    const publicIdsARemover = gridsExistentes
      .filter((grid) => !urlsFinales.has(grid.image))
      .map((grid) => obtenerPublicIdDesdeUrl(grid.image));

    await eliminarImagenes(publicIdsARemover, contexto.tenantId);

    revalidateTag(`tenant:${contexto.tenantId}:page-config`);
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
