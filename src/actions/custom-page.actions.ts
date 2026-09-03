"use server";

import { prisma } from "@/lib/prisma";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getCustomPages() {
  const { id: tenantId } = await requiereTenantActivo();
  return prisma.customPage.findMany({
    where: { tenantId },
    include: {
      sections: {
        include: { items: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomPageById(id: string) {
  const { id: tenantId } = await requiereTenantActivo();
  return prisma.customPage.findFirst({
    where: { id, tenantId },
    include: {
      sections: {
        include: { items: true },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getCustomPageBySlug(slug: string) {
  const { id: tenantId } = await requiereTenantActivo();
  return prisma.customPage.findFirst({
    where: { slug, tenantId },
    include: {
      sections: {
        include: { items: true },
        orderBy: { order: "asc" },
      },
    },
  });
}

interface CreateCustomPageInput {
  slug: string;
  title: string;
  subtitle?: string;
  isActive?: boolean;
}

export async function createCustomPage(data: CreateCustomPageInput) {
  const { tenantId } = await requiereAdmin();
  return prisma.customPage.create({ data: { ...data, tenantId } });
}

interface UpdateCustomPageInput {
  slug?: string;
  title?: string;
  subtitle?: string | null;
  isActive?: boolean;
}

export async function updateCustomPage(id: string, data: UpdateCustomPageInput) {
  const { tenantId } = await requiereAdmin();
  const existente = await prisma.customPage.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!existente) throw new Error("La página no pertenece a la tienda activa");
  return prisma.customPage.update({ where: { id: existente.id }, data });
}

export async function deleteCustomPage(id: string) {
  const { tenantId } = await requiereAdmin();
  return prisma.customPage.deleteMany({ where: { id, tenantId } });
}
