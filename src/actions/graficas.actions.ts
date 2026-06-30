"use server";

import { prisma } from "@/lib/prisma";
import { serializeData } from "@/lib/utils";

export async function getDashboardStats() {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  // ── Movimientos de SALIDA de los últimos 6 meses ─────────────────────────
  const movements = await prisma.movement.findMany({
    where: {
      type: "OUT",
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      quantity: true,
      priceAtTime: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Agrupar por mes
  const salesByMonth: Record<string, { quantity: number; revenue: number }> = {};
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  movements.forEach((m) => {
    const date = new Date(m.createdAt);
    const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    if (!salesByMonth[key]) salesByMonth[key] = { quantity: 0, revenue: 0 };
    salesByMonth[key].quantity += m.quantity;
    salesByMonth[key].revenue += Number(m.priceAtTime) * m.quantity;
  });

  const salesChart = Object.entries(salesByMonth).map(([name, data]) => ({
    name,
    Unidades: data.quantity,
    Ingresos: Math.round(data.revenue),
  }));

  // ── Productos con stock bajo (≤ 3 unidades por variante) ─────────────────
  const lowStockVariants = await prisma.garmentVariant.findMany({
    where: {
      stock: { lte: 3 },
      garment: { active: true },
    },
    include: {
      garment: {
        select: { id: true, name: true, category: { select: { name: true } } },
      },
      size: { select: { value: true } },
      color: { select: { name: true } },
    },
    orderBy: { stock: "asc" },
    take: 20,
  });

  // ── Totales generales ─────────────────────────────────────────────────────
  const [totalGarments, totalMovementsOut, totalMovementsIn] = await Promise.all([
    prisma.garment.count({ where: { active: true } }),
    prisma.movement.count({ where: { type: "OUT" } }),
    prisma.movement.count({ where: { type: "IN" } }),
  ]);

  return serializeData({
    salesChart,
    lowStockVariants,
    totals: {
      totalGarments,
      totalMovementsOut,
      totalMovementsIn,
      lowStockCount: lowStockVariants.length,
    },
  });
}