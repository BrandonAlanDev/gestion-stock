import { conPrisma } from "@/lib/prisma";

export async function obtenerOrdenMaximo(tenantId: string): Promise<number | null> {
  void tenantId;
  const resultado = await conPrisma((prisma) => prisma.carousel.aggregate({
    where: {},
    _max: { order: true },
  }));
  return resultado._max.order;
}
