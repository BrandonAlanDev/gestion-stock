import ChartWrapper from "@/components/ui/ChartWrapperClient";
import { getDashboardStats } from "@/actions/estadisticas/obtener-estadisticas-dashboard";
import { getPageConfig } from "@/actions/page-config/general.actions";
import { obtenerColorContraste } from "@/lib/utilidades/obtener-color-contraste";
import { redirect } from "next/navigation";

export default async function PanelEstadisticas() {
  const estadisticas = await getDashboardStats().catch((error: unknown) => {
    if (error instanceof Error && error.message === "No autorizado") {
      redirect("/login?callbackUrl=%2Fdashboard&recuperarSesion=1");
    }
    throw error;
  });

  const { pageConfig } = await getPageConfig();

  const colorSecundario = pageConfig?.secondaryColor || "#fafafa";
  const colorTexto = obtenerColorContraste(colorSecundario);

  return (
    <div
      className="min-h-screen p-6 md:p-12 transition-colors duration-200 overflow-scroll"
      style={{ backgroundColor: colorSecundario, color: colorTexto }}
    >
      <div className="w-full">
        <ChartWrapper stats={estadisticas} />
      </div>
    </div>
  );
}
