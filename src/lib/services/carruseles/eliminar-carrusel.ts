import { conPrisma } from "@/lib/prisma";

export async function eliminarCarrusel(tenantId: string, id: string) {
  return conPrisma(async (prisma) => {
    const resultado = await prisma.carousel.deleteMany({ where: { id } });
    if (resultado.count !== 1) throw new Error("El carrusel no pertenece a la tienda activa");
    return resultado;
  });
}
