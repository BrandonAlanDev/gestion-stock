"use server";

import { obtenerCategoriasCacheadas } from "@/lib/cache/obtener-categorias-cacheadas";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getCategories() {
  const { tenantId } = await requiereAdmin();
  return obtenerCategoriasCacheadas(tenantId);
}
