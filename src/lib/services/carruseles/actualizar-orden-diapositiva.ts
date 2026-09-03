import { prisma } from "@/lib/prisma";

export async function actualizarOrdenDiapositiva(tenantId: string, id: string, order: number) {
  const existente = await prisma.carouselSlide.findFirst({
    where: { id, tenantId, carousel: { tenantId } },
    select: { id: true },
  });
  if (!existente) throw new Error("La diapositiva no pertenece a la tienda activa");
  return prisma.carouselSlide.update({ where: { id }, data: { order } });
}
