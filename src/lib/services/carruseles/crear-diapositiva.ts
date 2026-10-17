import { conPrismaTenant } from "@/lib/prisma";
import type { EntradaDiapositivaCarrusel } from "@/lib/services/carruseles/tipos";
import type { Prisma } from "../../../../generated/prisma/client";

export async function crearDiapositiva(
  tenantId: string,
  datos: EntradaDiapositivaCarrusel & { carouselId: string },
) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const carrusel = await prisma.carousel.findFirst({
      where: { id: datos.carouselId },
      select: { id: true },
    });
    if (!carrusel) throw new Error("El carrusel no pertenece a la tienda activa");
    return prisma.carouselSlide.create({
      data: {
        ...datos,
        config: datos.config as Prisma.InputJsonValue | undefined,
      },
    });
  });
}
