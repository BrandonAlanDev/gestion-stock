import { INCLUDE_VARIANTE } from "@/lib/services/prendas/incluir-variante";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function obtenerPrendaPorId(tenantId: string, id: string) {
  return conPrismaTenant(tenantId, (prisma) => prisma.garment.findFirst({
    where: { id, tenantId },
    include: {
      category: true,
      subCategory: true,
      variants: { where: { tenantId }, include: INCLUDE_VARIANTE },
      supplier: { include: { contacts: { where: { tenantId, active: true } } } },
      images: { where: { tenantId }, orderBy: { order: "asc" } },
      opciones: { where: { tenantId }, include: { values: true }, orderBy: { position: "asc" } },
    },
  }));
}
