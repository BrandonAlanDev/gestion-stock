import { prisma } from "@/lib/prisma";

export async function contarSubcategorias(tenantId: string, categoriaId: string) {
  return prisma.subCategory.count({ where: { tenantId, categoryId: categoriaId } });
}
