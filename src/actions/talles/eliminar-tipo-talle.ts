"use server";

import * as servicioTalles from "@/lib/services/size-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { revalidarTalles } from "./revalidar-talles";

export async function deleteSizeType(id: string) {
  try {
    const { tenantId } = await requiereAdmin();
    await servicioTalles.deleteSizeType(tenantId, id);
    revalidarTalles(tenantId);
    return { success: true };
  } catch {
    return { error: "No se puede eliminar: el grupo está siendo usado por una categoría." };
  }
}
