"use server";

import { revalidateTag } from "next/cache";
import { actualizarProveedor } from "@/lib/services/proveedores/actualizar-proveedor";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { normalizeContact, updateProviderSchema } from "@/lib/zod";

export async function updateProvider(datos: unknown) {
  const contexto = await requiereAdmin();
  const resultado = updateProviderSchema.safeParse(datos);
  if (!resultado.success) return { error: resultado.error.issues[0].message };

  try {
    const proveedor = await actualizarProveedor(
      contexto.tenantId,
      resultado.data.id,
      {
        nombre: resultado.data.name,
        detalles: resultado.data.details,
        contactos: resultado.data.contacts.map(normalizeContact),
      },
    );
    revalidateTag(`tenant:${contexto.tenantId}:providers`);
    return { success: true, provider: proveedor };
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "Proveedor o contacto duplicado" };
    }
    return { error: "No se pudo actualizar el proveedor" };
  }
}
