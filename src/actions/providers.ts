"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createProviderSchema,
  updateProviderSchema,
  idSchema,
  normalizeContact,
  getContactType,
} from "@/lib/zod";

export async function getProviders() {
  return prisma.provider.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      contacts: { where: { active: true } },
    },
  });
}

export async function createProvider(raw: unknown) {
  const parsed = createProviderSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, details, contacts } = parsed.data;

  try {
    const provider = await prisma.$transaction(async (tx) => {
      return tx.provider.create({
        data: {
          name,
          details,
          contacts: {
            create: contacts.map((c) => {
              const contact = normalizeContact(c);
              return {
                contact,
                type: getContactType(contact),
              };
            }),
          },
        },
        include: { contacts: true },
      });
    });

    revalidatePath("provider");
    return { success: true, provider };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Proveedor o contacto duplicado" };
    }
    return { error: "Error al crear" };
  }
}

export async function updateProvider(raw: unknown) {
  const parsed = updateProviderSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { id, name, details, contacts } = parsed.data;

  try {
    const provider = await prisma.$transaction(async (tx) => {
      await tx.provider.update({
        where: { id },
        data: { name, details },
      });

      const normalized = contacts.map(normalizeContact);

      for (const contact of normalized) {
        await tx.contactProvider.upsert({
          where: {
            contact_provider_unique: {
              contact,
              idProvider: id,
            },
          },
          update: { active: true },
          create: {
            contact,
            idProvider: id,
            type: getContactType(contact),
          },
        });
      }

      await tx.contactProvider.updateMany({
        where: {
          idProvider: id,
          contact: { notIn: normalized },
        },
        data: { active: false },
      });

      return tx.provider.findUnique({
        where: { id },
        include: { contacts: true },
      });
    });

    revalidatePath("provider");
    return { success: true, provider };
  } catch {
    return { error: "Error al actualizar" };
  }
}

export async function deleteProvider(id: unknown) {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { error: "ID inválido" };

  await prisma.provider.update({
    where: { id: parsed.data },
    data: { active: false },
  });

  revalidatePath("provider");
  return { success: true };
}