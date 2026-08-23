"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag, unstable_cache } from "next/cache";
import {
  eliminarImagenes,
  obtenerPublicIdDesdeUrl,
} from "@/lib/services/cloudinary-service";

type BrandingInput = {
  storeName?: string;
  slogan?: string | null;
  description?: string | null;
  logo?: string | null;
  favicon?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  bgColor?: string | null;

  fontPrimary?: string;
  fontSecondary?: string;
  borderRadius?: string;
  shadowLevel?: string;
  density?: string;
};

export async function updateBrandingConfig(data: BrandingInput) {
  try {
    const pageConfig = await prisma.pageConfig.findFirst();

    const logoAnterior = pageConfig?.logo ?? null;
    const faviconAnterior = pageConfig?.favicon ?? null;

    const payload = {
      storeName: data.storeName?.trim() || pageConfig?.storeName || "GestionOK",

      slogan: data.slogan ?? pageConfig?.slogan ?? null,

      description: data.description ?? pageConfig?.description ?? null,

      primaryColor: data.primaryColor ?? pageConfig?.primaryColor ?? "#06b6d4",

      secondaryColor:
        data.secondaryColor ?? pageConfig?.secondaryColor ?? "#ffffff",

      bgColor: data.bgColor ?? pageConfig?.bgColor ?? "#09090b",

      logo: data.logo ?? pageConfig?.logo ?? null,

      favicon: data.favicon ?? pageConfig?.favicon ?? null,

      fontPrimary: data.fontPrimary ?? pageConfig?.fontPrimary ?? "Outfit",

      fontSecondary:
        data.fontSecondary ?? pageConfig?.fontSecondary ?? "Playfair Display",

      borderRadius:
        data.borderRadius ?? pageConfig?.borderRadius ?? "redondeado",

      shadowLevel: data.shadowLevel ?? pageConfig?.shadowLevel ?? "sutil",

      density: data.density ?? pageConfig?.density ?? "comoda",
    };

    const pageConfigActualizado = pageConfig
      ? await prisma.pageConfig.update({
          where: {
            id: pageConfig.id,
          },
          data: payload,
        })
      : await prisma.pageConfig.create({
          data: payload,
        });

    const publicIdsAEliminar: Array<string | null | undefined> = [];

    if (payload.logo !== logoAnterior) {
      const publicIdLogo = obtenerPublicIdDesdeUrl(logoAnterior ?? "");
      if (publicIdLogo) publicIdsAEliminar.push(publicIdLogo);
    }

    if (payload.favicon !== faviconAnterior) {
      const publicIdFavicon = obtenerPublicIdDesdeUrl(faviconAnterior ?? "");
      if (publicIdFavicon) publicIdsAEliminar.push(publicIdFavicon);
    }

    await eliminarImagenes(publicIdsAEliminar);

    revalidateTag("page-config");
    revalidateTag("branding-config");

    return {
      ok: true,
      pageConfig: pageConfigActualizado,
    };
  } catch (error) {
    console.error("[CLOUDINARY][PAGE-CONFIG][BRANDING]", error);

    return {
      ok: false,
      error: "Error al actualizar branding",
    };
  }
}

export const getBrandingConfig = unstable_cache(
  async () => {
    try {
      const branding = await prisma.pageConfig.findFirst({
        select: {
          storeName: true,
          slogan: true,
          description: true,
          logo: true,
          favicon: true,
          primaryColor: true,
          secondaryColor: true,
          bgColor: true,

          banners: {
            orderBy: {
              order: "asc",
            },
            select: {
              id: true,
              order: true,
              image: true,
              title: true,
              subtitle: true,
              text: true,
              url: true,
            },
          },
        },
      });

      return {
        ok: true,
        branding,
      };
    } catch (error) {
      console.error("[CLOUDINARY][PAGE-CONFIG][BRANDING][GET]", error);

      return {
        ok: false,
        error: "Error al obtener branding",
      };
    }
  },
  ["branding-config"],
  {
    revalidate: 3600,
    tags: ["branding-config"],
  },
);
