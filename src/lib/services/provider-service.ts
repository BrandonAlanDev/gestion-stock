import { prisma } from "@/lib/prisma";

export async function getProviders() {
  return prisma.provider.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      contacts: { where: { active: true } },
    },
  });
}

export async function createProvider(data: any) {
  return prisma.$transaction(async (tx) => {
    return tx.provider.create({ data });
  });
}

export async function updateProvider(id: string, data: any) {
  return prisma.$transaction(async (tx) => {
    await tx.provider.update({ where: { id }, data: { name: data.name, details: data.details } });
    // Actualizar contactos – esta lógica estaba en la acción, la movemos al servicio
    const normalized = data.contacts.map((c: string) => c.trim());
    for (const contact of normalized) {
      await tx.contactProvider.upsert({
        where: {
          contact_provider_unique: { contact, idProvider: id },
        },
        update: { active: true },
        create: { contact, idProvider: id, type: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? "EMAIL" : "PHONE" },
      });
    }
    await tx.contactProvider.updateMany({
      where: { idProvider: id, contact: { notIn: normalized } },
      data: { active: false },
    });
    return tx.provider.findUnique({ where: { id }, include: { contacts: true } });
  });
}

export async function deleteProvider(id: string) {
  return prisma.provider.update({ where: { id }, data: { active: false } });
}