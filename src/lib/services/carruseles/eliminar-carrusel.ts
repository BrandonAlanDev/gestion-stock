import { prisma } from "@/lib/prisma";

export async function eliminarCarrusel(tenantId: string, id: string) {
  const resultado = await prisma.carousel.deleteMany({ where: { id, tenantId } });
  if (resultado.count !== 1) throw new Error("El carrusel no pertenece a la tienda activa");
  return resultado;
}
