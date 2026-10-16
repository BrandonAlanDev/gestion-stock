import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function obtenerCategoriasCompletas(tenantId: string) {
  return conPrismaTenant(tenantId, (prisma) => prisma.category.findMany({
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
  }));
}
