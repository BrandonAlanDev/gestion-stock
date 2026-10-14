"use server";

import { getCachedCategories } from "@/lib/cache";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getCategories() {
  const { tenantId } = await requiereAdmin();
  return getCachedCategories(tenantId);
}
