import { prisma } from "@/lib/prisma";

export async function crearSubcategoria(
  tenantId: string,
  datos: { name: string; categoryId: string; sizeTypeId: string | null },
) {
  const categoria = await prisma.category.findFirst({ where: { id: datos.categoryId, tenantId }, select: { id: true } });
  if (!categoria) throw new Error("Categoría no encontrada");
  if (datos.sizeTypeId) {
    const tipoTalle = await prisma.sizeType.findFirst({ where: { id: datos.sizeTypeId, tenantId }, select: { id: true } });
    if (!tipoTalle) throw new Error("Tipo de talle no encontrado");
  }
  return prisma.subCategory.create({ data: { ...datos, tenantId } });
}
