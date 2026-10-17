import { conPrismaTenant } from "@/lib/prisma";

export async function obtenerCategoriaPorNombre(tenantId: string, nombre: string) {
  return conPrismaTenant(tenantId, (prisma) => prisma.category.findFirst({
    where: { name: nombre, active: true },
    include: {
      subCategories: {
        where: { active: true },
        orderBy: { name: "asc" },
      },
      _count: {
        select: { garments: { where: { active: true } } },
      },
    },
  }));
}
