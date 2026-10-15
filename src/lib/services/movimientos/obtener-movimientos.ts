import "server-only";

import { prisma } from "@/lib/prisma";

export async function obtenerMovimientos(
  tenantId: string,
  pagina: number,
  limite: number,
) {
  const omitir = (pagina - 1) * limite;
  const [registros, total] = await Promise.all([
    prisma.movement.findMany({
      where: { tenantId },
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
    prisma.movement.count({ where: { tenantId } }),
  ]);

  return {
    movements: registros.map((movimiento) => ({
      ...movimiento,
      priceAtTime: Number(movimiento.priceAtTime),
    })),
    total,
  };
}
