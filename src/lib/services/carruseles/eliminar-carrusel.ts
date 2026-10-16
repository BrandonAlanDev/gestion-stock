import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function eliminarCarrusel(tenantId: string, id: string) {
  return conPrismaTenant(tenantId, async (prisma) => {
    const resultado = await prisma.carousel.deleteMany({ where: { id, tenantId } });
    if (resultado.count !== 1) throw new Error("El carrusel no pertenece a la tienda activa");
    return resultado;
  });
}
