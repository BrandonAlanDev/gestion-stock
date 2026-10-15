import { prisma } from "@/lib/prisma";

export async function eliminarSubcategoria(tenantId: string, id: string) {
  const resultado = await prisma.subCategory.deleteMany({ where: { id, tenantId } });
  if (resultado.count === 0) throw new Error("Subcategoría no encontrada");
  return resultado;
}
