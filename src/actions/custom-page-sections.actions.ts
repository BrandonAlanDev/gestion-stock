"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, SectionType as TipoSeccionPrisma } from "../../generated/prisma/client";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export type SectionType =
  | "HERO"
  | "TEXT"
  | "CARDS"
  | "FAQ"
  | "TIMELINE"
  | "CTA"
  | "GALLERY"
  | "FEATURES";

export async function getSectionById(id: string) {
  const { id: tenantId } = await requiereTenantActivo();
  return prisma.customSection.findFirst({
    where: { id, tenantId },
    include: { items: true },
  });
}

interface CreateSectionInput {
  pageId: string;
  type: SectionType;
  title?: string;
  subtitle?: string;
  order?: number;
  config?: Prisma.InputJsonValue;
}

export async function createSection(data: CreateSectionInput) {
  const { tenantId } = await requiereAdmin();
  const pagina = await prisma.customPage.findFirst({ where: { id: data.pageId, tenantId }, select: { id: true } });
  if (!pagina) throw new Error("La página no pertenece a la tienda activa");
  return prisma.customSection.create({
    data: {
      tenantId,
      pageId: data.pageId,
      type: data.type as TipoSeccionPrisma,
      title: data.title,
      subtitle: data.subtitle,
      order: data.order ?? 0,
      config: data.config,
    },
  });
}

interface UpdateSectionInput {
  type?: SectionType;
  title?: string | null;
  subtitle?: string | null;
  order?: number;
  config?: Prisma.InputJsonValue;
}

export async function updateSection(id: string, data: UpdateSectionInput) {
  const { tenantId } = await requiereAdmin();
  const seccion = await prisma.customSection.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!seccion) throw new Error("La sección no pertenece a la tienda activa");
  return prisma.customSection.update({
    where: { id: seccion.id },
    data: { ...data, type: data.type as TipoSeccionPrisma },
  });
}

export async function deleteSection(id: string) {
  const { tenantId } = await requiereAdmin();
  return prisma.customSection.deleteMany({ where: { id, tenantId } });
}

export async function getSectionItemById(id: string) {
  const { id: tenantId } = await requiereTenantActivo();
  return prisma.customSectionItem.findFirst({ where: { id, tenantId } });
}

interface CreateSectionItemInput {
  sectionId: string;
  title: string;
  description?: string;
  image?: string;
  icon?: string;
  link?: string;
  order?: number;
  config?: Prisma.InputJsonValue;
}

export async function createSectionItem(data: CreateSectionItemInput) {
  const { tenantId } = await requiereAdmin();
  const seccion = await prisma.customSection.findFirst({ where: { id: data.sectionId, tenantId }, select: { id: true } });
  if (!seccion) throw new Error("La sección no pertenece a la tienda activa");
  return prisma.customSectionItem.create({
    data: {
      tenantId,
      sectionId: data.sectionId,
      title: data.title,
      description: data.description,
      image: data.image,
      icon: data.icon,
      link: data.link,
      order: data.order ?? 0,
      config: data.config,
    },
  });
}

interface UpdateSectionItemInput {
  title?: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  link?: string | null;
  order?: number;
  config?: Prisma.InputJsonValue;
}

export async function updateSectionItem(id: string, data: UpdateSectionItemInput) {
  const { tenantId } = await requiereAdmin();
  const item = await prisma.customSectionItem.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!item) throw new Error("El elemento no pertenece a la tienda activa");
  return prisma.customSectionItem.update({ where: { id: item.id }, data });
}

export async function deleteSectionItem(id: string) {
  const { tenantId } = await requiereAdmin();
  return prisma.customSectionItem.deleteMany({ where: { id, tenantId } });
}
