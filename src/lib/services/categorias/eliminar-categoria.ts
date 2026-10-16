import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function eliminarCategoria(tenantId: string, id: string) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const resultado = await prisma.category.deleteMany({ where: { id, tenantId } });
    if (resultado.count === 0) throw new Error("Categoría no encontrada");
    return resultado;
  });
}
