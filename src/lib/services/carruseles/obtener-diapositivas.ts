import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function obtenerDiapositivas(tenantId: string, carouselId: string) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const carrusel = await prisma.carousel.findFirst({ where: { id: carouselId, tenantId }, select: { id: true } });
    if (!carrusel) return [];
    return prisma.carouselSlide.findMany({
      where: { carouselId, tenantId },
      orderBy: { order: "asc" },
    });
  });
}
