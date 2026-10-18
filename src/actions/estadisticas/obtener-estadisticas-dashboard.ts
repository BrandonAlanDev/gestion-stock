"use server";

import { obtenerEstadisticasDashboard } from "@/lib/services/estadisticas/obtener-estadisticas-dashboard";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getDashboardStats() {
  const { tenantId } = await requiereAdmin();
  return obtenerEstadisticasDashboard(tenantId);
}
