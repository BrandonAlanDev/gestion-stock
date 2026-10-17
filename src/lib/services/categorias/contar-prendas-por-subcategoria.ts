import { conPrisma } from "@/lib/prisma";

export async function contarPrendasPorSubcategoria(tenantId: string, subcategoriaId: string) {
  return conPrisma((prisma) =>
    prisma.garment.count({ where: { subCategoryId: subcategoriaId } }),
  );
}
