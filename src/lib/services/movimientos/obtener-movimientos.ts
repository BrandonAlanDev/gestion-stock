import "server-only";

import { conPrismaTenant } from "@/lib/prisma";

export async function obtenerMovimientos(
  tenantId: string,
  pagina: number,
  limite: number,
) {
  const omitir = (pagina - 1) * limite;
  return conPrismaTenant(tenantId, async (prisma) => {
    const [registros, total] = await Promise.all([
    prisma.movement.findMany({
      where: {},
      include: {
        garmentVariant: {
          include: {
            garment: true,
            size: true,
            optionValues: { include: { optionValue: { include: { option: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: omitir,
      take: limite,
    }),
    prisma.movement.count({ where: {} }),
    ]);

    return {
      movements: registros.map((movimiento) => ({
        ...movimiento,
        priceAtTime: Number(movimiento.priceAtTime),
      })),
      total,
    };
  });
}
