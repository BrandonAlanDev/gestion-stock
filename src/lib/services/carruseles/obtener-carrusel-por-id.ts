import { prisma } from "@/lib/prisma";
import { TIPOS_CARRUSEL_ADMITIDOS } from "@/lib/services/carruseles/constantes";

export async function obtenerCarruselPorId(tenantId: string, id: string) {
  return prisma.carousel.findFirst({
    where: { id, tenantId, type: { in: [...TIPOS_CARRUSEL_ADMITIDOS] } },
    include: { slides: { where: { tenantId }, orderBy: { order: "asc" } } },
  });
}
