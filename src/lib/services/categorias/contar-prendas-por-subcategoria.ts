import { conPrismaTenant } from "@/lib/prisma";

export async function contarPrendasPorSubcategoria(tenantId: string, subcategoriaId: string) {
  return conPrismaTenant(tenantId, (prisma) =>
    prisma.garment.count({ where: { subCategoryId: subcategoriaId } }),
  );
}
