import { prisma } from "@/lib/prisma";

export async function actualizarCategoria(tenantId: string, id: string, datos: { name: string; description?: string }) {
  const resultado = await prisma.category.updateMany({ where: { id, tenantId }, data: { name: datos.name } });
  if (resultado.count === 0) throw new Error("Categoría no encontrada");
  return prisma.category.findFirstOrThrow({ where: { id, tenantId } });
}
