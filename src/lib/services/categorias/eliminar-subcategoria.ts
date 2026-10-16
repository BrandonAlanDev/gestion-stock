import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function eliminarSubcategoria(tenantId: string, id: string) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const resultado = await prisma.subCategory.deleteMany({ where: { id, tenantId } });
    if (resultado.count === 0) throw new Error("Subcategoría no encontrada");
    return resultado;
  });
}
