"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import {
  eliminarImagenes,
  obtenerPublicIdDesdeUrl,
} from "@/lib/services/cloudinary-service";
import { RESET_DATA } from "@/actions/page-config/shared/reset-data";

export async function clearPageConfig() {
  try {
    const existing = await prisma.pageConfig.findUnique({
      where: { id: 1 },
      include: { banners: true },
    });

    if (!existing) {
      return {
        ok: false,
        error:
          "No existe configuración",
      };
    }

    const publicIdsAEliminar: Array<string | null | undefined> = [
      obtenerPublicIdDesdeUrl(existing.logo ?? ""),
      obtenerPublicIdDesdeUrl(existing.favicon ?? ""),
      ...existing.banners.map((banner) =>
        obtenerPublicIdDesdeUrl(banner.image ?? "")
      ),
    ].filter((publicId) => publicId !== null);

    const pageConfig =
      await prisma.pageConfig.update({
        where: { id: 1 },

        data: { ...RESET_DATA, banners: { deleteMany: {} } },
      });

    await eliminarImagenes(publicIdsAEliminar);

    revalidateTag("page-config");
    revalidateTag("branding-config");

    return { ok: true, pageConfig };
  } catch (error) {
    console.error("[CLOUDINARY][PAGE-CONFIG][MAINTENANCE]", error);
    return { ok: false, error: "Error al limpiar configuración" };
  }
}
