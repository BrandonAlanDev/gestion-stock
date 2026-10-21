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
      select: {
        id: true,
        type: true,
        quantity: true,
        priceAtTime: true,
        note: true,
        createdAt: true,
        garmentVariant: {
          select: {
            attributes: true,
            garment: { select: { name: true } },
            size: { select: { value: true } },
            optionValues: { select: { optionValue: { select: { value: true } } } },
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
