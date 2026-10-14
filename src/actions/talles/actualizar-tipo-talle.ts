"use server";

import { SizeTypeNameSchema } from "@/lib/validaciones/esquemas";
import * as servicioTalles from "@/lib/services/size-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { revalidarTalles } from "./revalidar-talles";

export async function updateSizeType(id: string, nombre: string) {
  const camposValidados = SizeTypeNameSchema.safeParse({ name: nombre });
  if (!camposValidados.success) {
    return { error: camposValidados.error.flatten().fieldErrors.name?.[0] };
  }

  try {
    const { tenantId } = await requiereAdmin();
    await servicioTalles.updateSizeType(tenantId, id, camposValidados.data.name);
    revalidarTalles(tenantId);
    return { success: true };
  } catch {
    return { error: "Error al actualizar el grupo" };
  }
}
