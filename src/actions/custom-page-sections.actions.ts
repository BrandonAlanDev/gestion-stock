"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma/client";

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
  return prisma.customSection.findUnique({
    where: { id },
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
  return prisma.customSection.create({
    data: {
      pageId: data.pageId,
      type: data.type as any,
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
  return prisma.customSection.update({
    where: { id },
    data: { ...data, type: data.type as any },
  });
}

export async function deleteSection(id: string) {
  return prisma.customSection.delete({ where: { id } });
}

export async function getSectionItemById(id: string) {
  return prisma.customSectionItem.findUnique({ where: { id } });
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
  return prisma.customSectionItem.create({
    data: {
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
  return prisma.customSectionItem.update({ where: { id }, data });
}

export async function deleteSectionItem(id: string) {
  return prisma.customSectionItem.delete({ where: { id } });
}
