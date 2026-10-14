"use server";

import { obtenerColoresCacheados } from "@/lib/cache/obtener-colores-cacheados";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getColors() {
  const { tenantId } = await requiereAdmin();
  return obtenerColoresCacheados(tenantId);
}
