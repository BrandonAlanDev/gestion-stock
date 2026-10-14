"use server";

import * as servicioTalles from "@/lib/services/size-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { revalidarTalles } from "./revalidar-talles";

export async function deleteSize(id: string) {
  try {
    const { tenantId } = await requiereAdmin();
    await servicioTalles.deleteSize(tenantId, id);
    revalidarTalles(tenantId);
    return { success: true };
  } catch {
    return { error: "No se puede borrar: talle en uso" };
  }
}
