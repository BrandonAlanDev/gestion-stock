"use server";

import { getCachedColors } from "@/lib/cache";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getColors() {
  const { tenantId } = await requiereAdmin();
  return getCachedColors(tenantId);
}
