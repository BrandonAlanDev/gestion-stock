import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function obtenerCategoriaConProductos(tenantId: string, nombreCategoria: string) {
  return conPrismaTenant(tenantId, (prisma) => prisma.category.findFirst({
    where: { name: nombreCategoria, active: true },
    include: {
      subCategories: {
        where: { active: true },
        orderBy: { name: "asc" },
      },
      garments: {
        where: { active: true },
        orderBy: { name: "asc" },
        include: {
          images: { where: {}, orderBy: { order: "asc" } },
          variants: {
            where: {},
            include: {
              size: true,
              color: true,
              optionValues: { include: { optionValue: { include: { option: true } } } },
            },
            orderBy: { size: { order: "asc" } },
          },
          subCategory: true,
          opciones: { where: {}, include: { values: true }, orderBy: { position: "asc" } },
        },
      },
      _count: { select: { garments: { where: { active: true } } } },
    },
  }));
}
