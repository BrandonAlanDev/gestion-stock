import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import type { EntradaDiapositivaCarrusel } from "@/lib/services/carruseles/tipos";
import type { Prisma } from "../../../../generated/prisma/client";

export async function crearDiapositiva(
  tenantId: string,
  datos: EntradaDiapositivaCarrusel & { carouselId: string },
) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const carrusel = await prisma.carousel.findFirst({
      where: { id: datos.carouselId, tenantId },
      select: { id: true },
    });
    if (!carrusel) throw new Error("El carrusel no pertenece a la tienda activa");
    return prisma.carouselSlide.create({
      data: {
        ...datos,
        tenantId,
        config: datos.config as Prisma.InputJsonValue | undefined,
      },
    });
  });
}
