import { conPrisma } from "@/lib/prisma";

export async function eliminarDiapositiva(tenantId: string, id: string) {
  return conPrisma(async (prisma) => {
    const existente = await prisma.carouselSlide.findFirst({
      where: { id, carousel: {} },
      select: { id: true },
    });
    if (!existente) throw new Error("La diapositiva no pertenece a la tienda activa");
    return prisma.carouselSlide.delete({ where: { id } });
  });
}
