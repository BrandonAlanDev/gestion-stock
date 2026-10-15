import { prisma } from "@/lib/prisma";

export async function eliminarCategoria(tenantId: string, id: string) {
  const resultado = await prisma.category.deleteMany({ where: { id, tenantId } });
  if (resultado.count === 0) throw new Error("Categoría no encontrada");
  return resultado;
}
