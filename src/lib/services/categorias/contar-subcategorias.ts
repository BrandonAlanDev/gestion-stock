import { conPrismaTenant } from "@/lib/prisma";

export async function contarSubcategorias(tenantId: string, categoriaId: string) {
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.subCategory.count({ where: { categoryId: categoriaId } }),
  );
}
