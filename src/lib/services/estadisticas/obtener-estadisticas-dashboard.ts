import "server-only";

import { conPrismaTenant } from "@/lib/prisma";

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

  return conPrismaTenant(tenantId, async (prisma) => {
    const [ventasMensuales, variantesStockBajo, totalProductos, totalSalidas, totalEntradas] =
    await Promise.all([
      prisma.$queryRaw<Array<{ mes: string; cantidad: bigint | number; ingresos: string | number }>>`
        SELECT DATE_FORMAT(createdAt, '%Y-%m') AS mes,
          SUM(quantity) AS cantidad,
          SUM(priceAtTime * quantity) AS ingresos
        FROM Movement
        WHERE type = 'OUT' AND createdAt >= ${desde}
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
        ORDER BY mes ASC
      `,
      prisma.garmentVariant.findMany({
        where: {
          stock: { lte: 3 },
          garment: { active: true },
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
          optionValues: { include: { optionValue: { include: { option: true } } } },
        },
        orderBy: { stock: "asc" },
        take: 20,
      }),
      prisma.garment.count({ where: { active: true } }),
      prisma.movement.count({ where: { type: "OUT" } }),
      prisma.movement.count({ where: { type: "IN" } }),
    ]);

    return {
      salesChart: ventasMensuales.map(({ mes, cantidad, ingresos }) => ({
        name: `${NOMBRES_MESES[Number(mes.slice(5, 7)) - 1]} ${mes.slice(0, 4)}`,
        Unidades: Number(cantidad),
        Ingresos: Math.round(Number(ingresos)),
      })),
      lowStockVariants: variantesStockBajo,
      totals: {
        totalGarments: totalProductos,
        totalMovementsOut: totalSalidas,
        totalMovementsIn: totalEntradas,
        lowStockCount: variantesStockBajo.length,
      },
    };
  });
}
