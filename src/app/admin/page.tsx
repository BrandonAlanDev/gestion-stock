import { getDashboardStats } from "@/actions/graficas.actions";
import { getPageConfig } from "@/actions/page-config/general.actions";
import { getContrastColor } from "@/lib/utils";
import dynamic from "next/dynamic";

const ChartWrapper = dynamic(() => import("@/components/ui/ChartsWrapper"), { ssr: false });

export default async function AdminPage() {
  const stats = await getDashboardStats();
  const { pageConfig } = await getPageConfig();

  const secondaryColor = pageConfig?.secondaryColor || "#fafafa";
  const textColor = getContrastColor(secondaryColor);

  return (
    <div
      className="min-h-screen p-6 md:p-12 transition-colors duration-200"
      style={{ backgroundColor: secondaryColor, color: textColor }}
    >
      <div className="w-full">
        <ChartWrapper stats={stats} />
      </div>
    </div>
  );
}
