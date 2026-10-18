import PanelEstadisticas from "@/components/dashboard/PanelEstadisticas";
import { obtenerTenantDeSesion } from "@/lib/tenants/obtener-tenant-de-sesion";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const contexto = await obtenerTenantDeSesion();
  if (contexto?.rol !== "ADMIN") redirect("/");
  return <PanelEstadisticas />;
}
