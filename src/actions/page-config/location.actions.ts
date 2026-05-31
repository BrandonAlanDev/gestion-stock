"use server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function updateLocationConfig(
  data: {
    locationEnabled?: boolean;

    address?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
    postalCode?: string | null;
    mapsUrl?: string | null;
  }
) {
  try {
    const location =
      await prisma.pageConfig.update({
        where: { id: 1 },

        data,
      });

    revalidateTag("page-config");
    return { ok: true, location };
  } catch {
    return { ok: false, error: "Error ubicación" };
  }
}

export async function getLocationConfig() {
  try {
    const location =
      await prisma.pageConfig.findUnique({
        where: { id: 1 },

        select: {
          locationEnabled: true,

          address: true,
          city: true,
          province: true,
          country: true,
          postalCode: true,

          mapsUrl: true,
        },
      });

    return { ok: true, location };
  } catch {
    return { ok: false, error: "Error ubicación" };
  }
}