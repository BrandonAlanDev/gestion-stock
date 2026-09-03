import { prisma } from "@/lib/prisma";
import type { CarouselType } from "@/types/carousel";

export async function contarCarruselesActivos(
  tenantId: string,
): Promise<Record<CarouselType, number>> {
  const carruseles = await prisma.carousel.findMany({
    where: { tenantId, active: true },
    select: { type: true },
  });
  const cantidades = { HERO: 0, BANNER: 0, CARDS: 0 } as Record<CarouselType, number>;
  for (const carrusel of carruseles) cantidades[carrusel.type]++;
  return cantidades;
}
