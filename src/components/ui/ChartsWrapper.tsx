"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";
import { AlertTriangle, Package, TrendingUp, ArrowUpDown, ShoppingBag } from "lucide-react";

interface Stats {
  salesChart: { name: string; Unidades: number; Ingresos: number }[];
  lowStockVariants: unknown[];
  totals: { totalGarments: number; totalMovementsOut: number; totalMovementsIn: number; lowStockCount: number };
}

export default function ChartWrapper({ stats }: { stats: Stats }) {
  const { pageConfig } = usePageConfig();
  const background = (pageConfig?.secondaryColor as string) || "#00b4d8";
  const accent = (pageConfig?.primaryColor as string) || "#FFFFFF";
  const textColor = getContrastColor(background);
  const isDarkBg = textColor === "#ffffff";

  const cardBg = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const borderColor = isDarkBg ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const mutedColor = textColor + "B3";

  const { salesChart, totals } = stats;

  const statCards = [
    { label: "Productos activos", value: totals.totalGarments, icon: Package, color: accent },
    { label: "Ventas totales", value: totals.totalMovementsOut, icon: TrendingUp, color: isDarkBg ? "#10b981" : "#059669" },
    { label: "Ingresos de stock", value: totals.totalMovementsIn, icon: ArrowUpDown, color: isDarkBg ? "#8b5cf6" : "#6d28d9" },
    {
      label: "Stock crítico",
      value: totals.lowStockCount,
      icon: AlertTriangle,
      color:
        totals.lowStockCount > 0
          ? isDarkBg ? "#ef4444" : "#b91c1c"
          : isDarkBg ? "#10b981" : "#059669",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: mutedColor }}>Panel de control</p>
        <h1 className="text-3xl font-black tracking-tight uppercase italic mt-1" style={{ color: textColor }}>Dashboard</h1>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl border flex flex-col gap-3" style={{ background: cardBg, borderColor }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: mutedColor }}>{s.label}</p>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* GRÁFICA */}
      <div className="rounded-2xl border p-6" style={{ background: cardBg, borderColor }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black uppercase italic" style={{ color: textColor }}>Movimientos de Salida</h2>
          <ShoppingBag size={20} style={{ color: accent }} />
        </div>

        {salesChart.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-sm" style={{ color: mutedColor }}>
            No hay movimientos registrados en los últimos 6 meses.
          </div>
        ) : (
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={borderColor} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: mutedColor }} />
                <YAxis yAxisId="left" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: mutedColor }} />
                <Tooltip contentStyle={{ background: isDarkBg ? "#181818" : "#ffffff", border: `1px solid ${borderColor}`, borderRadius: "12px", color: isDarkBg ? "#fff" : "#000" }} />
                <Bar yAxisId="left" dataKey="Unidades" fill={accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
