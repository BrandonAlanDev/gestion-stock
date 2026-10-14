"use server";

import { SizeValueSchema } from "@/lib/zod";
import * as servicioTalles from "@/lib/services/size-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { revalidarTalles } from "./revalidar-talles";

export async function addSizeToType(idTipoTalle: string, valor: string, orden: number) {
  const valorValidado = SizeValueSchema.safeParse(valor);
  if (!valorValidado.success) {
    return { error: valorValidado.error.issues[0]?.message ?? "Valor de talle inválido" };
  }

  try {
    const { tenantId } = await requiereAdmin();
    await servicioTalles.addSize(tenantId, idTipoTalle, valorValidado.data.toUpperCase(), Number(orden));
    revalidarTalles(tenantId);
    return { success: true };
  } catch {
    return { error: "Error al guardar en la base de datos" };
  }
}
