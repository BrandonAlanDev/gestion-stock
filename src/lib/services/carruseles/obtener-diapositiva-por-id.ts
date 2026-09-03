import { prisma } from "@/lib/prisma";

export async function obtenerDiapositivaPorId(tenantId: string, id: string) {
  return prisma.carouselSlide.findFirst({ where: { id, tenantId, carousel: { tenantId } } });
}
