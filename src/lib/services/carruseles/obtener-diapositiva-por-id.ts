import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function obtenerDiapositivaPorId(tenantId: string, id: string) {
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.carouselSlide.findFirst({ where: { id, carousel: {} } }),
  );
}
