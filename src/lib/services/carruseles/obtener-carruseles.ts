import { prisma } from "@/lib/prisma";
import type { CarouselType } from "@/types/carousel";

export async function obtenerCarruseles(
  tenantId: string,
  tipo?: CarouselType,
  soloActivos = true,
) {
  return prisma.carousel.findMany({
    where: {
      tenantId,
      ...(soloActivos ? { active: true } : {}),
      ...(tipo ? { type: tipo } : {}),
    },
    include: { slides: { where: { tenantId }, orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });
}
