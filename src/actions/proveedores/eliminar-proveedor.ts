"use server";

import { revalidateTag } from "next/cache";
import { eliminarProveedor } from "@/lib/services/proveedores/eliminar-proveedor";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { idSchema } from "@/lib/zod";

export async function deleteProvider(id: unknown) {
  const contexto = await requiereAdmin();
  const resultado = idSchema.safeParse(id);
  if (!resultado.success) return { error: "ID inválido" };

  try {
    await eliminarProveedor(contexto.tenantId, resultado.data);
    revalidateTag(`tenant:${contexto.tenantId}:providers`);
    return { success: true };
  } catch {
    return { error: "No se pudo eliminar el proveedor" };
  }
}
