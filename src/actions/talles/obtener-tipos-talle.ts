"use server";

import { getCachedSizeTypes } from "@/lib/cache";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getSizeTypes() {
  const { tenantId } = await requiereAdmin();
  return getCachedSizeTypes(tenantId);
}
