"use server";

import { prisma } from "@/lib/prisma";
import {
  revalidateTag,
  unstable_cache,
} from "next/cache";

type BannerInput = {
  image?: string | null;
  title?: string | null;
  subtitle?: string | null;
  text?: string | null;
  url?: string | null;
};

type BrandingInput = {
  storeName?: string;
  slogan?: string | null;
  description?: string | null;
  logo?: string | null;
  favicon?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;

  banners?: BannerInput[];
};

export async function updateBrandingConfig(
  data: BrandingInput
) {
  try {
    let pageConfig =
      await prisma.pageConfig.findFirst();

    const payload = {
      storeName:
        data.storeName?.trim() ||
        pageConfig?.storeName ||
        "GestionOK",

      slogan: data.slogan ?? null,

      description:
        data.description ?? null,

      primaryColor:
        data.primaryColor ??
        "#06b6d4",

      secondaryColor:
        data.secondaryColor ??
        "#ffffff",

      logo:
        data.logo ??
        pageConfig?.logo ??
        null,

      favicon:
        data.favicon ??
        pageConfig?.favicon ??
        null,
    };

    if (!pageConfig) {
      pageConfig =
        await prisma.pageConfig.create({
          data: payload,
        });
    } else {
      pageConfig =
        await prisma.pageConfig.update({
          where: {
            id: pageConfig.id,
          },
          data: payload,
        });
    }

    // Actualiza los banners
    if (data.banners) {
      await prisma.banner.deleteMany({
        where: {
          pageConfigId: pageConfig.id,
        },
      });

      if (data.banners.length > 0) {
        await prisma.banner.createMany({
          data: data.banners.map(
            (banner, index) => ({
              pageConfigId:
                pageConfig!.id,
              order: index + 1,
              image:
                banner.image ??
                null,
              title:
                banner.title ??
                null,
              subtitle:
                banner.subtitle ??
                null,
              text:
                banner.text ??
                null,
              url:
                banner.url ??
                null,
            })
          ),
        });
      }
    }

    revalidateTag("page-config");
    revalidateTag("branding-config");

    return {
      ok: true,
      pageConfig,
    };
  } catch (error) {
    console.error(
      "UPDATE BRANDING ERROR:",
      error
    );

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar branding",
    };
  }
}

export const getBrandingConfig =
  unstable_cache(
    async () => {
      try {
        const branding =
          await prisma.pageConfig.findFirst({
            select: {
              storeName: true,
              slogan: true,
              description: true,
              logo: true,
              favicon: true,
              primaryColor: true,
              secondaryColor: true,

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
        console.error(
          "GET BRANDING ERROR:",
          error
        );

        return {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Error al obtener branding",
        };
      }
    },
    ["branding-config"],
    {
      revalidate: 3600,
      tags: ["branding-config"],
    }
  );