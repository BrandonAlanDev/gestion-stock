"use server";

import { prisma } from "@/lib/prisma";

import {
  getOrCreatePageConfig,
} from "./shared/get-page-config";

import {
  uploadPageImage,
} from "./shared/upload-page-image";

export async function updateBrandingConfig(
  data: {
    storeName?: string;
    slogan?: string | null;

    logo?: string | null;
    banner?: string | null;
    favicon?: string | null;

    primaryColor?: string | null;
    secondaryColor?: string | null;
  }
) {
  try {
    const existing =
      await getOrCreatePageConfig();

    const logo =
      await uploadPageImage(
        data.logo,
        existing.logo,
        "gestion-stock/page-config/logo"
      );

    const banner =
      await uploadPageImage(
        data.banner,
        existing.banner,
        "gestion-stock/page-config/banner"
      );

    const favicon =
      await uploadPageImage(
        data.favicon,
        existing.favicon,
        "gestion-stock/page-config/favicon"
      );

    const branding =
      await prisma.pageConfig.update({
        where: { id: 1 },

        data: {
          storeName: data.storeName,
          slogan: data.slogan,

          logo,
          banner,
          favicon,

          primaryColor:
            data.primaryColor,

          secondaryColor:
            data.secondaryColor,
        },
      });

    return {
      ok: true,
      branding,
    };
  } catch (error) {
    console.error(error);

    return {
      ok: false,
      error:
        "Error al actualizar branding",
    };
  }
}

export async function getBrandingConfig() {
  try {
    const branding =
      await prisma.pageConfig.findUnique({
        where: { id: 1 },

        select: {
          storeName: true,
          slogan: true,

          logo: true,
          favicon: true,
          banner: true,

          primaryColor: true,
          secondaryColor: true,
        },
      });

    return {
      ok: true,
      branding,
    };
  } catch {
    return {
      ok: false,
      error:
        "Error al obtener branding",
    };
  }
}