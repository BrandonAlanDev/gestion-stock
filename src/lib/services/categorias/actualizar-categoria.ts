import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function actualizarCategoria(tenantId: string, id: string, datos: { name: string; description?: string }) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const resultado = await prisma.category.updateMany({ where: { id, tenantId }, data: { name: datos.name } });
    if (resultado.count === 0) throw new Error("Categoría no encontrada");
    return prisma.category.findFirstOrThrow({ where: { id, tenantId } });
  });
}
