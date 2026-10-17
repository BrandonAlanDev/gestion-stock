import { conPrismaTenant } from "@/lib/tenants/prisma-factory";

export async function obtenerOrdenMaximo(tenantId: string): Promise<number | null> {
  const resultado = await conPrismaTenant(tenantId, (prisma) => prisma.carousel.aggregate({
    where: {},
    _max: { order: true },
  }));
  return resultado._max.order;
}
