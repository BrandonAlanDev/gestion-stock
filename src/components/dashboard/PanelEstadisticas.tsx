import ChartWrapper from "@/components/ui/ChartWrapperClient";
import { getDashboardStats } from "@/actions/estadisticas/obtener-estadisticas-dashboard";
import { getPageConfig } from "@/actions/page-config/general.actions";
import { obtenerColorContraste } from "@/lib/utilidades/obtener-color-contraste";
import { redirect } from "next/navigation";

export default async function PanelEstadisticas({
  modoAdmin = false,
}: {
  modoAdmin?: boolean;
}) {
  const [estadisticas, configuracion] = await Promise.all([
    getDashboardStats().catch((error: unknown) => {
      if (error instanceof Error && error.message === "No autorizado") {
        redirect("/login?callbackUrl=%2Fdashboard&recuperarSesion=1");
      }
      throw error;
    }),
    modoAdmin ? Promise.resolve(null) : getPageConfig(),
  ]);

  const colorSecundario = configuracion?.pageConfig?.secondaryColor || "#fafafa";
  const colorTexto = obtenerColorContraste(colorSecundario);

  return (
    <div
      className={`min-h-screen px-4 py-7 sm:px-6 lg:px-8 transition-colors duration-200 ${modoAdmin ? "bg-[var(--admin-fondo)] text-[var(--admin-texto)]" : ""}`}
      style={modoAdmin ? undefined : { backgroundColor: colorSecundario, color: colorTexto }}
    >
      <div className={modoAdmin ? "mx-auto max-w-7xl" : "w-full"}>
        <ChartWrapper stats={estadisticas} modoAdmin={modoAdmin} />
      </div>
    </div>
  );
}
