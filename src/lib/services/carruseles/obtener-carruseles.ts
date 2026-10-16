import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import { TIPOS_CARRUSEL_ADMITIDOS } from "@/lib/services/carruseles/constantes";
import type { CarouselType } from "@/types/carousel";

export async function obtenerCarruseles(
  tenantId: string,
  tipo?: CarouselType,
  soloActivos = true,
) {
  const tipos = tipo
    ? TIPOS_CARRUSEL_ADMITIDOS.filter((tipoAdmitido) => tipoAdmitido === tipo)
    : [...TIPOS_CARRUSEL_ADMITIDOS];

  return conPrismaTenant(tenantId, (prisma) => prisma.carousel.findMany({
    where: {
      tenantId,
      ...(soloActivos ? { active: true } : {}),
      type: { in: tipos },
    },
    include: { slides: { where: { tenantId }, orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  }));
}
