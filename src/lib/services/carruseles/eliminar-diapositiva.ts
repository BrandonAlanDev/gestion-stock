import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function eliminarDiapositiva(tenantId: string, id: string) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const existente = await prisma.carouselSlide.findFirst({
      where: { id, tenantId, carousel: { tenantId } },
      select: { id: true },
    });
    if (!existente) throw new Error("La diapositiva no pertenece a la tienda activa");
    return prisma.carouselSlide.delete({ where: { id } });
  });
}
