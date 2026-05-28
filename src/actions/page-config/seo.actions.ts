"use server";

import { prisma } from "@/lib/prisma";

export async function updateSeoConfig(
  data: {
    metaTitle?: string | null;
    metaDescription?: string | null;
  }
) {
  try {
    const seo =
      await prisma.pageConfig.update({
        where: { id: 1 },

        data,
      });

    return {
      ok: true,
      seo,
    };
  } catch {
    return {
      ok: false,
      error:
        "Error SEO",
    };
  }
}

export async function getSeoConfig() {
  try {
    const seo =
      await prisma.pageConfig.findUnique({
        where: { id: 1 },

        select: {
          metaTitle: true,
          metaDescription: true,
        },
      });

    return {
      ok: true,
      seo,
    };
  } catch {
    return {
      ok: false,
      error:
        "Error SEO",
    };
  }
}