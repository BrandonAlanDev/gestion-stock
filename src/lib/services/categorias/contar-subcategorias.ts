import { conPrisma } from "@/lib/prisma";

export async function contarSubcategorias(tenantId: string, categoriaId: string) {
  return conPrisma((prisma) =>
    prisma.subCategory.count({ where: { categoryId: categoriaId } }),
  );
}
