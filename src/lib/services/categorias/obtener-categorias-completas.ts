import { prisma } from "@/lib/prisma";

export async function obtenerCategoriasCompletas(tenantId: string) {
  return prisma.category.findMany({
    where: { tenantId },
    include: {
      subCategories: {
        where: { tenantId },
        include: {
          sizeType: {
            include: { sizes: { where: { tenantId }, orderBy: { order: "asc" } } },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}
