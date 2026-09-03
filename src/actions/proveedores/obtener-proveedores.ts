"use server";

import { getCachedProviders } from "@/lib/cache";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getProviders() {
  const { tenantId } = await requiereAdmin();
  return getCachedProviders(tenantId);
}
