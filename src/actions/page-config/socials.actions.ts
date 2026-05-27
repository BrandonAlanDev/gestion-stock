"use server";

import { prisma } from "@/lib/prisma";

export async function updateSocialsConfig(
  data: {
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    x?: string | null;
    youtube?: string |null;
    linkedin?: string | null;
  }
) {
  try {
    const socials =
      await prisma.pageConfig.update({
        where: { id: 1 },

        data,
      });

    return {
      ok: true,
      socials,
    };
  } catch {
    return {
      ok: false,
      error:
        "Error redes sociales",
    };
  }
}

export async function getSocialsConfig() {
  try {
    const socials =
      await prisma.pageConfig.findUnique({
        where: { id: 1 },

        select: {
          instagram: true,
          facebook: true,
          tiktok: true,
          x: true,
          youtube: true,
          linkedin: true,
        },
      });

    return {
      ok: true,
      socials,
    };
  } catch {
    return {
      ok: false,
      error:
        "Error redes sociales",
    };
  }
}