import { conPrisma } from "@/lib/prisma";

export async function eliminarCategoria(tenantId: string, id: string) {
  return conPrisma(async (prisma) => {
    const resultado = await prisma.category.deleteMany({ where: { id } });
    if (resultado.count === 0) throw new Error("Categoría no encontrada");
    return resultado;
  });
}
