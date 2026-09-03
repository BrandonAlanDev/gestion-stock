"use server";

import { revalidateTag } from "next/cache";
import { crearProveedor } from "@/lib/services/proveedores/crear-proveedor";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import {
  createProviderSchema,
  getContactType,
  normalizeContact,
} from "@/lib/zod";

export async function createProvider(datos: unknown) {
  const contexto = await requiereAdmin();
  const resultado = createProviderSchema.safeParse(datos);
  if (!resultado.success) return { error: resultado.error.issues[0].message };

  try {
    const proveedor = await crearProveedor(contexto.tenantId, {
      nombre: resultado.data.name,
      detalles: resultado.data.details,
      contactos: resultado.data.contacts.map((valor) => {
        const contacto = normalizeContact(valor);
        return { contacto, tipo: getContactType(contacto) };
      }),
    });
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
    return { error: "No se pudo crear el proveedor" };
  }
}
