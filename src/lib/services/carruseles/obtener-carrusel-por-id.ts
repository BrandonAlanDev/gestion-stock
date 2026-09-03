import { prisma } from "@/lib/prisma";

export async function obtenerCarruselPorId(tenantId: string, id: string) {
  return prisma.carousel.findFirst({
    where: { id, tenantId },
    include: { slides: { where: { tenantId }, orderBy: { order: "asc" } } },
  });
}
