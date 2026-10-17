import { conPrismaTenant } from "@/lib/prisma";

export async function obtenerDiapositivas(tenantId: string, carouselId: string) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const carrusel = await prisma.carousel.findFirst({ where: { id: carouselId }, select: { id: true } });
    if (!carrusel) return [];
    return prisma.carouselSlide.findMany({
      where: { carouselId },
      orderBy: { order: "asc" },
    });
  });
}
