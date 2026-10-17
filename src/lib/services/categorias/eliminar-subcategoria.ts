import { conPrismaTenant } from "@/lib/prisma";

export async function eliminarSubcategoria(tenantId: string, id: string) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const resultado = await prisma.subCategory.deleteMany({ where: { id } });
    if (resultado.count === 0) throw new Error("Subcategoría no encontrada");
    return resultado;
  });
}
