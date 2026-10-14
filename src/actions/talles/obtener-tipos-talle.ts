"use server";

import { obtenerTiposTalleCacheados } from "@/lib/cache/obtener-tipos-de-talle-cacheados";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getSizeTypes() {
  const { tenantId } = await requiereAdmin();
  return obtenerTiposTalleCacheados(tenantId);
}
