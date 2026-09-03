import { prisma } from "@/lib/prisma";

export async function obtenerOrdenMaximo(tenantId: string): Promise<number | null> {
  const resultado = await prisma.carousel.aggregate({
    where: { tenantId },
    _max: { order: true },
  });
  return resultado._max.order;
}
