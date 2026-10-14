"use server";

import { prisma } from "@/lib/prisma";
import { obtenerPublicIdDesdeUrl } from "@/lib/services/imagenes-cloudinary/obtener-public-id-desde-url";
import { eliminarImagenes } from "@/lib/services/imagenes-cloudinary/eliminar-imagenes";
import { deleteGarment as eliminarRegistroPrenda } from "@/lib/services/garment-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { revalidateTag } from "next/cache";

export async function eliminarPrenda(id: string) {
  const { tenantId } = await requiereAdmin();
  try {
    const prendaExistente = await prisma.garment.findFirst({
      where: { id, tenantId },
      include: { images: { where: { tenantId } } },
    });
    if (!prendaExistente) return { error: "El producto no existe o ya fue eliminado." };

    await eliminarRegistroPrenda(tenantId, id);
    const idsPublicos = prendaExistente.images.map((imagen) => imagen.publicId ?? obtenerPublicIdDesdeUrl(imagen.srcImage));
    await eliminarImagenes(idsPublicos, tenantId);
    revalidateTag(`tenant:${tenantId}:products`);
    revalidateTag(`tenant:${tenantId}:product:${id}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("ERROR_AL_ELIMINAR_PRENDA:", error);
    if ((error as { code?: string })?.code === "P2003") return { error: "No se puede eliminar: existen registros vinculados." };
    return { error: "Ocurrió un error inesperado al intentar eliminar el producto." };
  }
}
