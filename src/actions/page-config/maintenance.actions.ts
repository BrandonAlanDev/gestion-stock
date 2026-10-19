"use server";

import { revalidateTag } from "next/cache";
import { eliminarImagenes } from "@/lib/services/imagenes-cloudinary/eliminar-imagenes";
import { obtenerPublicIdDesdeUrl } from "@/lib/services/imagenes-cloudinary/obtener-public-id-desde-url";
import { RESET_DATA } from "@/actions/page-config/shared/reset-data";
import { requerirPageConfigAdministrador } from "@/actions/page-config/shared/requerir-page-config-administrador";
import { conPrisma } from "@/lib/prisma";

export async function clearPageConfig() {
  try {
    const { contexto, pageConfig: configActual } = await requerirPageConfigAdministrador();
    const existing = await conPrisma((prisma) =>
      prisma.pageConfig.findFirst({
        where: { id: configActual.id },
        include: { banners: { where: {} } },
      }),
    );

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

    const pageConfig = await conPrisma((prisma) =>
      prisma.pageConfig.update({
        where: { id: existing.id },
        data: { ...RESET_DATA, banners: { deleteMany: {} } },
      }),
    );

    await eliminarImagenes(publicIdsAEliminar, contexto.tenantId);

    revalidateTag(`tenant:${contexto.tenantId}:page-config`);
    revalidateTag(`tenant:${contexto.tenantId}:branding-config`);

    return { ok: true, pageConfig };
  } catch (error) {
    console.error("[CLOUDINARY][PAGE-CONFIG][MAINTENANCE]", error);
    return { ok: false, error: "Error al limpiar configuración" };
  }
}
