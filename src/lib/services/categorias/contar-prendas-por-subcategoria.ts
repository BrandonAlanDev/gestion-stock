import { prisma } from "@/lib/prisma";

export async function contarPrendasPorSubcategoria(tenantId: string, subcategoriaId: string) {
  return prisma.garment.count({ where: { tenantId, subCategoryId: subcategoriaId } });
}
