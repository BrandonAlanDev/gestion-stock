import { prisma } from "@/lib/prisma";

export async function getCategoriesFull(tenantId: string) {
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

export async function createCategory(tenantId: string, name: string) {
  return prisma.category.create({ data: { tenantId, name } });
}

export async function updateCategory(tenantId: string, id: string, data: { name: string; description?: string }) {
  const resultado = await prisma.category.updateMany({ where: { id, tenantId }, data: { name: data.name } });
  if (resultado.count === 0) throw new Error("Categoría no encontrada");
  return prisma.category.findFirstOrThrow({ where: { id, tenantId } });
}

export async function deleteCategory(tenantId: string, id: string) {
  const resultado = await prisma.category.deleteMany({ where: { id, tenantId } });
  if (resultado.count === 0) throw new Error("Categoría no encontrada");
  return resultado;
}

export async function getSubCategoriesCount(tenantId: string, categoryId: string) {
  return prisma.subCategory.count({ where: { tenantId, categoryId } });
}

export async function createSubCategory(
  tenantId: string,
  data: { name: string; categoryId: string; sizeTypeId: string | null }
) {
  const categoria = await prisma.category.findFirst({ where: { id: data.categoryId, tenantId }, select: { id: true } });
  if (!categoria) throw new Error("Categoría no encontrada");
  if (data.sizeTypeId) {
    const tipoTalle = await prisma.sizeType.findFirst({ where: { id: data.sizeTypeId, tenantId }, select: { id: true } });
    if (!tipoTalle) throw new Error("Tipo de talle no encontrado");
  }
  return prisma.subCategory.create({ data: { ...data, tenantId } });
}

export async function deleteSubCategory(tenantId: string, id: string) {
  const resultado = await prisma.subCategory.deleteMany({ where: { id, tenantId } });
  if (resultado.count === 0) throw new Error("Subcategoría no encontrada");
  return resultado;
}

export async function getGarmentCountBySubCategory(tenantId: string, subCategoryId: string) {
  return prisma.garment.count({ where: { tenantId, subCategoryId } });
}

// Para la página pública de categoría (se usa en [categoria]/page.tsx)
export async function getCategoryWithProducts(tenantId: string, categoryName: string) {
  return prisma.category.findFirst({
    where: { tenantId, name: categoryName, active: true },
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

export async function getCategoryByName(tenantId: string, name: string) {
  return prisma.category.findFirst({
    where: { tenantId, name, active: true },
    include: {
      subCategories: {
        where: { tenantId, active: true },
        orderBy: { name: "asc" },
      },
      _count: {
        select: { garments: { where: { active: true } } },
      },
    },
  });
}
