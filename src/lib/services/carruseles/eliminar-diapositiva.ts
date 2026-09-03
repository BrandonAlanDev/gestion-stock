import { prisma } from "@/lib/prisma";

export async function eliminarDiapositiva(tenantId: string, id: string) {
  const existente = await prisma.carouselSlide.findFirst({
    where: { id, tenantId, carousel: { tenantId } },
    select: { id: true },
  });
  if (!existente) throw new Error("La diapositiva no pertenece a la tienda activa");
  return prisma.carouselSlide.delete({ where: { id } });
}
