import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function contarPrendasPorSubcategoria(tenantId: string, subcategoriaId: string) {
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.garment.count({ where: { tenantId, subCategoryId: subcategoriaId } }),
  );
}
