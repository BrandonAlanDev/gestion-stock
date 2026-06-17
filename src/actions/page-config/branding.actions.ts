"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache, revalidateTag } from "next/cache";

type BrandingInput = {
  storeName?: string;
  slogan?: string | null;
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  favicon?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
};

export async function updateBrandingConfig(
  data: BrandingInput
) {
  try {
    const existing =
      await prisma.pageConfig.findFirst();

    const storeName =
      data.storeName?.trim() ||
      existing?.storeName ||
      "GestionOK";

    const payload = {
      storeName,
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
        data.logo ||
        existing?.logo ||
        null,

      banner:
        data.banner ||
        existing?.banner ||
        null,

      favicon:
        data.favicon ||
        existing?.favicon ||
        null,
    };

    console.log(
      "BRANDING PAYLOAD",
      payload
    );

    const pageConfig = existing
      ? await prisma.pageConfig.update({
          where: {
            id: existing.id,
          },
          data: payload,
        })
      : await prisma.pageConfig.create({
          data: payload,
        });

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
              banner: true,
              favicon: true,
              primaryColor: true,
              secondaryColor: true,
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
    { revalidate: 3600 }
  );