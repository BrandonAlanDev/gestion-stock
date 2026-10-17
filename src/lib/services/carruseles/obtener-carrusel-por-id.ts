import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import { TIPOS_CARRUSEL_ADMITIDOS } from "@/lib/services/carruseles/constantes";

export async function obtenerCarruselPorId(tenantId: string, id: string) {
  return conPrismaTenant(tenantId, (prisma) => prisma.carousel.findFirst({
    where: { id, type: { in: [...TIPOS_CARRUSEL_ADMITIDOS] } },
    include: { slides: { where: {}, orderBy: { order: "asc" } } },
  }));
}
