"use server";

import { obtenerProveedoresCacheados } from "@/lib/cache/obtener-proveedores-cacheados";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getProviders() {
  const { tenantId } = await requiereAdmin();
  return obtenerProveedoresCacheados(tenantId);
}
