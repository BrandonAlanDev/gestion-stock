import { conPrisma } from "@/lib/prisma";

export async function actualizarOrdenDiapositiva(tenantId: string, id: string, order: number) {
  return conPrisma(async (prisma) => {
    const existente = await prisma.carouselSlide.findFirst({
      where: { id, carousel: {} },
      select: { id: true },
    });
    if (!existente) throw new Error("La diapositiva no pertenece a la tienda activa");
    return prisma.carouselSlide.update({ where: { id }, data: { order } });
  });
}
