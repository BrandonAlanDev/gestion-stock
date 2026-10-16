import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function contarSubcategorias(tenantId: string, categoriaId: string) {
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.subCategory.count({ where: { tenantId, categoryId: categoriaId } }),
  );
}
