import { prisma } from "@/lib/prisma";

export async function obtenerCategoriaConProductos(tenantId: string, nombreCategoria: string) {
  return prisma.category.findFirst({
    where: { tenantId, name: nombreCategoria, active: true },
    include: {
      subCategories: {
        where: { tenantId, active: true },
        orderBy: { name: "asc" },
      },
      garments: {
        where: { tenantId, active: true },
        orderBy: { name: "asc" },
        include: {
          images: { where: { tenantId }, orderBy: { order: "asc" } },
          variants: {
            where: { tenantId },
            include: {
              size: true,
              color: true,
              optionValues: { include: { optionValue: { include: { option: true } } } },
            },
            orderBy: { size: { order: "asc" } },
          },
          subCategory: true,
          opciones: { where: { tenantId }, include: { values: true }, orderBy: { position: "asc" } },
        },
      },
      _count: { select: { garments: { where: { active: true } } } },
    },
  });
}
