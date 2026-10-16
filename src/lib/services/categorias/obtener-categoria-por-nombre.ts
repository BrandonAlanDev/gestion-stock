import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function obtenerCategoriaPorNombre(tenantId: string, nombre: string) {
  return conPrismaTenant(tenantId, (prisma) => prisma.category.findFirst({
    where: { tenantId, name: nombre, active: true },
    include: {
      subCategories: {
        where: { tenantId, active: true },
        orderBy: { name: "asc" },
      },
      _count: {
        select: { garments: { where: { active: true } } },
      },
    },
  }));
}
