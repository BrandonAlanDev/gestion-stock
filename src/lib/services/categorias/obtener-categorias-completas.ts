import { conPrisma } from "@/lib/prisma";

export async function obtenerCategoriasCompletas(tenantId: string) {
  void tenantId;
  return conPrisma((prisma) => prisma.category.findMany({
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
