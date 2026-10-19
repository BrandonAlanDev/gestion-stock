"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { obtenerColorContraste as getContrastColor } from "@/lib/utilidades/obtener-color-contraste";
import { AlertTriangle, Package, TrendingUp, ArrowUpDown, ShoppingBag } from "lucide-react";
import { useContext } from "react";
import { ContextoTemaAdmin } from "@/contextos/admin/contexto-tema-admin";

interface Stats {
  salesChart: { name: string; Unidades: number; Ingresos: number }[];
  lowStockVariants: unknown[];
  totals: { totalGarments: number; totalMovementsOut: number; totalMovementsIn: number; lowStockCount: number };
}

export default function ChartWrapper({
  stats,
  modoAdmin = false,
}: {
  stats: Stats;
  modoAdmin?: boolean;
}) {
  const { pageConfig } = usePageConfig();
  const contextoTemaAdmin = useContext(ContextoTemaAdmin);
  const temaOscuro = contextoTemaAdmin?.tema === "oscuro";
  const background = (pageConfig?.secondaryColor as string) || "#00b4d8";
  const accent = modoAdmin ? "var(--admin-primario)" : (pageConfig?.primaryColor as string) || "#FFFFFF";
  const textColor = modoAdmin ? "var(--admin-texto)" : getContrastColor(background);
  const isDarkBg = modoAdmin ? temaOscuro : textColor === "#ffffff";

  const cardBg = modoAdmin ? "var(--admin-fondo-opaco)" : isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const borderColor = modoAdmin ? "var(--admin-borde)" : isDarkBg ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const mutedColor = modoAdmin ? "var(--admin-texto-suave)" : textColor + "B3";

  const { salesChart, totals } = stats;

  const statCards = [
    { label: "Productos activos", value: totals.totalGarments, icon: Package, color: accent },
    { label: "Ventas totales", value: totals.totalMovementsOut, icon: TrendingUp, color: modoAdmin ? "var(--admin-exito)" : isDarkBg ? "#10b981" : "#059669" },
    { label: "Ingresos de stock", value: totals.totalMovementsIn, icon: ArrowUpDown, color: modoAdmin ? "var(--admin-acento)" : isDarkBg ? "#8b5cf6" : "#6d28d9" },
    {
      label: "Stock crítico",
      value: totals.lowStockCount,
      icon: AlertTriangle,
      color:
        totals.lowStockCount > 0
          ? modoAdmin ? "var(--admin-peligro)" : isDarkBg ? "#ef4444" : "#b91c1c"
          : modoAdmin ? "var(--admin-exito)" : isDarkBg ? "#10b981" : "#059669",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: textColor }}>{modoAdmin ? "Inicio" : "Panel de control"}</h1>
        <p className="mt-1 text-sm" style={{ color: mutedColor }}>Resumen de tu tienda e inventario.</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="flex flex-col gap-3 rounded-lg p-5" style={{ background: cardBg, border: modoAdmin ? "none" : `1px solid ${borderColor}` }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: mutedColor }}>{s.label}</p>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-semibold tabular-nums" style={{ color: textColor }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* GRÁFICA */}
      <div className="rounded-lg p-5 sm:p-6" style={{ background: cardBg, border: modoAdmin ? "none" : `1px solid ${borderColor}` }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold" style={{ color: textColor }}>Salidas de stock</h2>
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
                <Tooltip contentStyle={{ background: modoAdmin ? "var(--admin-fondo-opaco)" : isDarkBg ? "#181818" : "#ffffff", border: `1px solid ${borderColor}`, borderRadius: "12px", color: modoAdmin ? "var(--admin-texto)" : isDarkBg ? "#fff" : "#000" }} />
                <Bar yAxisId="left" dataKey="Unidades" fill={accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
