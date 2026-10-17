import { conPrisma } from "@/lib/prisma";

export async function obtenerDiapositivaPorId(tenantId: string, id: string) {
  return conPrisma((prisma) =>
    prisma.carouselSlide.findFirst({ where: { id, carousel: {} } }),
  );
}
