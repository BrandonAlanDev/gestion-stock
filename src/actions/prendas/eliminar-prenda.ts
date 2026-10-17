"use server";

import { obtenerPublicIdDesdeUrl } from "@/lib/services/imagenes-cloudinary/obtener-public-id-desde-url";
import { eliminarImagenes } from "@/lib/services/imagenes-cloudinary/eliminar-imagenes";
import { eliminarRegistroPrenda } from "@/lib/services/prendas/eliminar-registro-prenda";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import { revalidateTag } from "next/cache";

export async function eliminarPrenda(id: string) {
  const { tenantId } = await requiereAdmin();
  try {
    const prendaExistente = await conPrismaTenant(tenantId, (prisma) => prisma.garment.findFirst({
      where: { id },
      include: { images: { where: {} } },
    }));
    if (!prendaExistente) return { error: "El producto no existe o ya fue eliminado." };

    await conPrismaTenant(tenantId, (prisma) => eliminarRegistroPrenda(prisma, tenantId, id));
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
