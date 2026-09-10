"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import type {
  PageConfig_featuredLayout,
  GridLinkType,
  LinkStyle,
  ButtonVariant,
} from "../../../generated/prisma/client";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { obtenerCarpetaGrids } from "@/lib/services/imagenes-cloudinary/obtener-carpeta-grids";
import { subirImagen } from "@/lib/services/imagenes-cloudinary/subir-imagen";
import { eliminarImagenes } from "@/lib/services/imagenes-cloudinary/eliminar-imagenes";
import { obtenerPublicIdDesdeUrl } from "@/lib/services/imagenes-cloudinary/obtener-public-id-desde-url";

interface SeccionDestacadaGrid {
  title: string;
  subtitle: string;
  image: string;
  order: number;
  linkType: GridLinkType;
  linkValue?: string;
  subtitleNeon?: boolean;
  subtitleDim?: boolean;
  linkStyle?: LinkStyle;
  buttonVariant?: ButtonVariant;
  buttonText?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

const PREFIJO_DESTACADA = "featured_";

function parsearOrden(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const d: unknown = JSON.parse(raw);
    return Array.isArray(d) ? d.filter((i): i is string => typeof i === "string") : [];
  } catch {
    return [];
  }
}

function insertarAntesDeUbicacion(secciones: string[], id: string): string[] {
  const idx = secciones.indexOf("location");
  const en = idx >= 0 ? idx : secciones.length;
  return [...secciones.slice(0, en), id, ...secciones.slice(en)];
}

export async function crearSeccionDestacada() {
  const { contexto, pageConfig } = await requerirPageConfigAdministrador();

  const nuevo = await prisma.homegrid.create({
    data: {
      tenantId: contexto.tenantId,
      title: "",
      subtitle: "",
      style: 1,
      columns: "md:grid-cols-2",
      active: true,
      featuredLayout: "GRID",
    },
  });

  const orden = insertarAntesDeUbicacion(
    parsearOrden(pageConfig.sectionOrder),
    PREFIJO_DESTACADA + nuevo.id
  );

  await prisma.pageConfig.update({
    where: { id: pageConfig.id },
    data: { sectionOrder: JSON.stringify(orden) },
  });

  revalidateTag(`page-config:${contexto.tenantId}`);
  revalidatePath("/");

  return { ok: true, homegridId: nuevo.id };
}

export async function actualizarSeccionDestacada(
  homegridId: string,
  grids: SeccionDestacadaGrid[],
  title: string,
  featuredLayout?: string
): Promise<{ ok: boolean; error?: string; homegridId?: string }> {
  const publicIdsSubidos: string[] = [];
  let tenantId: string | null = null;
  try {
    const { contexto } = await requerirPageConfigAdministrador();
    tenantId = contexto.tenantId;

    const okPaginas = grids.every(
      (g) => g.linkType !== "PAGE" || /^\/(?!\/)/.test(g.linkValue?.trim() || "")
    );
    if (!okPaginas) {
      return { ok: false, error: "Las páginas de destino deben comenzar con una sola barra (/)" };
    }

    const homegrid = await prisma.homegrid.findFirst({
      where: { id: homegridId, tenantId: contexto.tenantId },
      select: { id: true },
    });
    if (!homegrid) return { ok: false, error: "La sección no pertenece a la tienda activa" };

    await prisma.homegrid.update({
      where: { id: homegrid.id },
      data: {
        title: title ?? "",
        ...(featuredLayout
          ? { featuredLayout: featuredLayout.toUpperCase() as PageConfig_featuredLayout }
          : {}),
      },
    });

    let gridsProcesados: SeccionDestacadaGrid[] | null = null;
    try {
      gridsProcesados = await Promise.all(
        grids.map(async (g, indice) => {
          if (g.image.startsWith("data:image")) {
            const subida = await subirImagen(
              g.image,
              obtenerCarpetaGrids(contexto.tenantId, homegridId),
              `imagen-${Date.now()}-${indice + 1}`
            );
            publicIdsSubidos.push(subida.publicId);
            return { ...g, image: subida.url };
          }
          return g;
        })
      );
    } catch (error) {
      console.error("[CLOUDINARY][SECCION-DESTACADA][ACTUALIZAR][SUBIDA]", error);
      await eliminarImagenes(publicIdsSubidos, contexto.tenantId);
      return { ok: false, error: "No se pudieron actualizar las secciones" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.grid.deleteMany({
        where: { homegridId: homegrid.id, tenantId: contexto.tenantId },
      });

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
          homegridId: homegrid.id,
        })),
      });
    });

    const gridsExistentes = await prisma.grid.findMany({
      where: { homegridId: homegrid.id, tenantId: contexto.tenantId },
    });
    const urlsFinales = new Set(gridsProcesados!.map((g) => g.image));
    const publicIdsARemover = gridsExistentes
      .filter((grid) => !urlsFinales.has(grid.image))
      .map((grid) => obtenerPublicIdDesdeUrl(grid.image));
    if (publicIdsARemover.length) {
      await eliminarImagenes(publicIdsARemover, contexto.tenantId);
    }

    revalidateTag(`page-config:${contexto.tenantId}`);
    revalidatePath("/");

    return { ok: true, homegridId: homegrid.id };
  } catch (error) {
    console.error("[CLOUDINARY][SECCION-DESTACADA][ACTUALIZAR]", error);
    if (tenantId && publicIdsSubidos.length > 0) {
      await eliminarImagenes(publicIdsSubidos, tenantId);
    }
    return { ok: false, error: "No se pudieron actualizar las secciones" };
  }
}

export async function alternarVisibilidadSeccionDestacada(homegridId: string) {
  const { contexto } = await requerirPageConfigAdministrador();

  const hg = await prisma.homegrid.findFirst({
    where: { id: homegridId, tenantId: contexto.tenantId },
    select: { id: true, active: true },
  });
  if (!hg) return { ok: false, error: "La sección no pertenece a la tienda activa" };

  await prisma.homegrid.update({
    where: { id: hg.id },
    data: { active: !hg.active },
  });

  revalidateTag(`page-config:${contexto.tenantId}`);
  revalidatePath("/");

  return { ok: true, activo: !hg.active };
}

export async function duplicarSeccionDestacada(homegridId: string) {
  const { contexto, pageConfig } = await requerirPageConfigAdministrador();

  const fuente = await prisma.homegrid.findFirst({
    where: { id: homegridId, tenantId: contexto.tenantId },
    include: { grids: true },
  });
  if (!fuente) return { ok: false, error: "La sección no pertenece a la tienda activa" };

  const copia = await prisma.homegrid.create({
    data: {
      tenantId: contexto.tenantId,
      title: fuente.title ? fuente.title + " (copia)" : "",
      subtitle: fuente.subtitle,
      style: fuente.style,
      columns: fuente.columns,
      active: true,
      featuredLayout: fuente.featuredLayout,
    },
  });

  for (const g of fuente.grids) {
    await prisma.grid.create({
      data: {
        tenantId: contexto.tenantId,
        title: g.title,
        subtitle: g.subtitle,
        image: g.image,
        order: g.order,
        linkType: g.linkType,
        linkValue: g.linkValue,
        subtitleNeon: g.subtitleNeon,
        subtitleDim: g.subtitleDim,
        linkStyle: g.linkStyle,
        buttonVariant: g.buttonVariant,
        buttonText: g.buttonText,
        buttonBgColor: g.buttonBgColor,
        buttonTextColor: g.buttonTextColor,
        homegridId: copia.id,
      },
    });
  }

  const orden = insertarAntesDeUbicacion(
    parsearOrden(pageConfig.sectionOrder),
    PREFIJO_DESTACADA + copia.id
  );
  await prisma.pageConfig.update({
    where: { id: pageConfig.id },
    data: { sectionOrder: JSON.stringify(orden) },
  });

  revalidateTag(`page-config:${contexto.tenantId}`);
  revalidatePath("/");

  return { ok: true, homegridId: copia.id };
}

export async function eliminarSeccionDestacada(homegridId: string) {
  const { contexto, pageConfig } = await requerirPageConfigAdministrador();

  const homegrid = await prisma.homegrid.findFirst({
    where: { id: homegridId, tenantId: contexto.tenantId },
    include: { grids: true },
  });
  if (!homegrid) return { ok: false, error: "La sección no pertenece a la tienda activa" };

  const publicIds = homegrid.grids
    .map((g) => obtenerPublicIdDesdeUrl(g.image))
    .filter(Boolean);

  await prisma.homegrid.delete({ where: { id: homegrid.id } });

  const orden = parsearOrden(pageConfig.sectionOrder).filter(
    (s) => s !== PREFIJO_DESTACADA + homegrid.id
  );
  await prisma.pageConfig.update({
    where: { id: pageConfig.id },
    data: { sectionOrder: JSON.stringify(orden) },
  });

  if (publicIds.length) {
    await eliminarImagenes(publicIds as string[], contexto.tenantId);
  }

  revalidateTag(`page-config:${contexto.tenantId}`);
  revalidatePath("/");

  return { ok: true };
}
