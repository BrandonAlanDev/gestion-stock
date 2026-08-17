"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag, unstable_cache } from "next/cache";

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
    let pageConfig = await prisma.pageConfig.findFirst();

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

    if (!pageConfig) {
      pageConfig = await prisma.pageConfig.create({
        data: payload,
      });
    } else {
      pageConfig = await prisma.pageConfig.update({
        where: {
          id: pageConfig.id,
        },
        data: payload,
      });
    }

    revalidateTag("page-config");
    revalidateTag("branding-config");

    return {
      ok: true,
      pageConfig,
    };
  } catch (error) {
    console.error("UPDATE BRANDING ERROR:", error);

    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Error al actualizar branding",
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
      console.error("GET BRANDING ERROR:", error);

      return {
        ok: false,
        error:
          error instanceof Error ? error.message : "Error al obtener branding",
      };
    }
  },
  ["branding-config"],
  {
    revalidate: 3600,
    tags: ["branding-config"],
  },
);
