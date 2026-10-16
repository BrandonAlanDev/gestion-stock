import type { PrismaClient } from "@/../generated/prisma/client";

export async function eliminarRegistroPrenda(prisma: PrismaClient, tenantId: string, id: string) {
  const resultado = await prisma.garment.deleteMany({ where: { id, tenantId } });
  if (resultado.count === 0) throw new Error("Producto no encontrado");
  return resultado;
}
