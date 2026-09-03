import { prisma } from "@/lib/prisma";
import type { EntradaDiapositivaCarrusel } from "@/lib/services/carruseles/tipos";
import type { Prisma } from "../../../../generated/prisma/client";

export async function crearDiapositiva(
  tenantId: string,
  datos: EntradaDiapositivaCarrusel & { carouselId: string },
) {
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
}
