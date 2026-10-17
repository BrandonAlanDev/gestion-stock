import { conPrismaTenant } from "@/lib/prisma";

export async function obtenerDiapositivaPorId(tenantId: string, id: string) {
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.carouselSlide.findFirst({ where: { id, carousel: {} } }),
  );
}
