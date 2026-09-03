import "server-only";

import { prisma } from "@/lib/prisma";

const NOMBRES_MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

export async function obtenerEstadisticasDashboard(tenantId: string) {
  const desde = new Date();
  desde.setMonth(desde.getMonth() - 6);

  const [movimientos, variantesStockBajo, totalProductos, totalSalidas, totalEntradas] =
    await Promise.all([
      prisma.movement.findMany({
        where: { tenantId, type: "OUT", createdAt: { gte: desde } },
        select: { quantity: true, priceAtTime: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.garmentVariant.findMany({
        where: {
          tenantId,
          stock: { lte: 3 },
          garment: { tenantId, active: true },
        },
        include: {
          garment: {
            select: {
              id: true,
              name: true,
              category: { select: { name: true } },
            },
          },
          size: { select: { value: true } },
          color: { select: { name: true } },
        },
        orderBy: { stock: "asc" },
        take: 20,
      }),
      prisma.garment.count({ where: { tenantId, active: true } }),
      prisma.movement.count({ where: { tenantId, type: "OUT" } }),
      prisma.movement.count({ where: { tenantId, type: "IN" } }),
    ]);

  const ventasPorMes: Record<string, { cantidad: number; ingresos: number }> = {};
  for (const movimiento of movimientos) {
    const fecha = new Date(movimiento.createdAt);
    const clave = `${NOMBRES_MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
    ventasPorMes[clave] ??= { cantidad: 0, ingresos: 0 };
    ventasPorMes[clave].cantidad += movimiento.quantity;
    ventasPorMes[clave].ingresos +=
      Number(movimiento.priceAtTime) * movimiento.quantity;
  }

  return {
    salesChart: Object.entries(ventasPorMes).map(([name, valores]) => ({
      name,
      Unidades: valores.cantidad,
      Ingresos: Math.round(valores.ingresos),
    })),
    lowStockVariants: variantesStockBajo,
    totals: {
      totalGarments: totalProductos,
      totalMovementsOut: totalSalidas,
      totalMovementsIn: totalEntradas,
      lowStockCount: variantesStockBajo.length,
    },
  };
}
