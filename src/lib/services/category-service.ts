import { prisma } from "@/lib/prisma";

export async function getCategoriesFull() {
  return prisma.category.findMany({
    include: {
      subCategories: {
        include: {
          sizeType: {
            include: { sizes: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(name: string) {
  return prisma.category.create({ data: { name } });
}

export async function updateCategory(id: string, data: { name: string; description?: string }) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

export async function getSubCategoriesCount(categoryId: string) {
  return prisma.subCategory.count({ where: { categoryId } });
}

export async function createSubCategory(data: {
  name: string;
  categoryId: string;
  sizeTypeId: string | null;
}) {
  return prisma.subCategory.create({ data });
}

export async function deleteSubCategory(id: string) {
  return prisma.subCategory.delete({ where: { id } });
}

export async function getGarmentCountBySubCategory(subCategoryId: string) {
  return prisma.garment.count({ where: { subCategoryId } });
}

// Para la página pública de categoría (se usa en [categoria]/page.tsx)
export async function getCategoryWithProducts(categoryName: string) {
  return prisma.category.findFirst({
    where: { name: categoryName, active: true },
    include: {
      subCategories: {
        where: { active: true },
        orderBy: { name: "asc" },
      },
      garments: {
        where: { active: true },
        orderBy: { name: "asc" },
        include: {
          images: { orderBy: { order: "asc" } },
          variants: {
            include: { size: true, color: true },
            orderBy: { size: { order: "asc" } },
          },
          subCategory: true,
        },
      },
      _count: { select: { garments: { where: { active: true } } } },
    },
  });
}

export async function getCategoryByName(name: string) {
  return prisma.category.findFirst({
    where: { name, active: true },
    include: {
      subCategories: {
        where: { active: true },
        orderBy: { name: "asc" },
      },
      _count: {
        select: { garments: { where: { active: true } } },
      },
    },
  });
}