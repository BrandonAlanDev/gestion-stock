import { conPrismaTenant } from "@/lib/prisma";

export async function crearSubcategoria(
  tenantId: string,
  datos: { name: string; categoryId: string; sizeTypeId: string | null },
) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const categoria = await prisma.category.findFirst({ where: { id: datos.categoryId }, select: { id: true } });
    if (!categoria) throw new Error("Categoría no encontrada");
    if (datos.sizeTypeId) {
      const tipoTalle = await prisma.sizeType.findFirst({ where: { id: datos.sizeTypeId }, select: { id: true } });
      if (!tipoTalle) throw new Error("Tipo de talle no encontrado");
    }
    return prisma.subCategory.create({ data: { ...datos } });
  });
}
