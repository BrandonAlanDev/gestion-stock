"use server";

import { obtenerEstadisticasDashboard } from "@/lib/services/estadisticas/obtener-estadisticas-dashboard";
import { requiereUsuarioTenant } from "@/lib/tenants/requerir-usuario-tenant";

export async function getDashboardStats() {
  const { tenantId } = await requiereUsuarioTenant();
  return obtenerEstadisticasDashboard(tenantId);
}
