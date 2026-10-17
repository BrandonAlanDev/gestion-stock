import { conPrismaTenant } from "@/lib/prisma";

export async function obtenerCategoriasCompletas(tenantId: string) {
  return conPrismaTenant(tenantId, (prisma) => prisma.category.findMany({
    where: {},
    include: {
      subCategories: {
        where: {},
        include: {
          sizeType: {
            include: { sizes: { where: {}, orderBy: { order: "asc" } } },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  }));
}
