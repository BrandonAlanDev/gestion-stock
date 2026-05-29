"use server";
import { revalidatePath } from "next/cache";
import {
  createProviderSchema,
  updateProviderSchema,
  idSchema,
  normalizeContact,
  getContactType,
} from "@/lib/zod";
import { getCachedProviders } from "@/lib/cache";
import * as providerService from "@/lib/services/provider-service";

export const getProviders = getCachedProviders;

export async function createProvider(raw: unknown) {
  const parsed = createProviderSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, details, contacts } = parsed.data;
  try {
    const provider = await providerService.createProvider({
      data: {
        name,
        details,
        contacts: {
          create: contacts.map((c) => {
            const contact = normalizeContact(c);
            return { contact, type: getContactType(contact) };
          }),
        },
      },
      include: { contacts: true },
    });
    revalidatePath("provider");
    return { success: true, provider };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Proveedor o contacto duplicado" };
    return { error: "Error al crear" };
  }
}

export async function updateProvider(raw: unknown) {
  const parsed = updateProviderSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { id, name, details, contacts } = parsed.data;
  try {
    const provider = await providerService.updateProvider(id, { name, details, contacts });
    revalidatePath("provider");
    return { success: true, provider };
  } catch {
    return { error: "Error al actualizar" };
  }
}

export async function deleteProvider(id: unknown) {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { error: "ID inválido" };

  await providerService.deleteProvider(parsed.data);
  revalidatePath("provider");
  return { success: true };
}