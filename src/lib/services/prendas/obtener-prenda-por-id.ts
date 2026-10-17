import { INCLUDE_VARIANTE } from "@/lib/services/prendas/incluir-variante";
import { conPrisma } from "@/lib/prisma";

export async function obtenerPrendaPorId(tenantId: string, id: string) {
  return conPrisma((prisma) => prisma.garment.findFirst({
    where: { id },
    include: {
      category: true,
      subCategory: true,
      variants: { where: {}, include: INCLUDE_VARIANTE },
      supplier: { include: { contacts: { where: { active: true } } } },
      images: { where: {}, orderBy: { order: "asc" } },
      opciones: { where: {}, include: { values: true }, orderBy: { position: "asc" } },
    },
  }));
}
