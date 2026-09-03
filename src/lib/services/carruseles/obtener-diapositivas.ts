import { prisma } from "@/lib/prisma";

export async function obtenerDiapositivas(tenantId: string, carouselId: string) {
  const carrusel = await prisma.carousel.findFirst({ where: { id: carouselId, tenantId }, select: { id: true } });
  if (!carrusel) return [];
  return prisma.carouselSlide.findMany({
    where: { carouselId, tenantId },
    orderBy: { order: "asc" },
  });
}
