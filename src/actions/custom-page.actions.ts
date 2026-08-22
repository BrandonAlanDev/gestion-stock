"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma/client";

/* =====================================================
   TYPES
===================================================== */

export type SectionType =
  | "HERO"
  | "TEXT"
  | "CARDS"
  | "FAQ"
  | "TIMELINE"
  | "CTA"
  | "GALLERY"
  | "FEATURES";

/* =====================================================
   CUSTOM PAGES
===================================================== */

export async function getCustomPages() {
  return prisma.customPage.findMany({
    include: {
      sections: {
        include: {
          items: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCustomPageById(id: string) {
  return prisma.customPage.findUnique({
    where: { id },
    include: {
      sections: {
        include: {
          items: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

export async function getCustomPageBySlug(slug: string) {
  return prisma.customPage.findUnique({
    where: { slug },
    include: {
      sections: {
        include: {
          items: true,
        },
        orderBy: {
          order: "asc",
        },
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

export async function createCustomPage(
  data: CreateCustomPageInput
) {
  return prisma.customPage.create({
    data,
  });
}

interface UpdateCustomPageInput {
  slug?: string;
  title?: string;
  subtitle?: string | null;
  isActive?: boolean;
}

export async function updateCustomPage(
  id: string,
  data: UpdateCustomPageInput
) {
  return prisma.customPage.update({
    where: { id },
    data,
  });
}

export async function deleteCustomPage(id: string) {
  return prisma.customPage.delete({
    where: { id },
  });
}

/* =====================================================
   CUSTOM SECTIONS
===================================================== */

export async function getSectionById(id: string) {
  return prisma.customSection.findUnique({
    where: { id },
    include: {
      items: true,
    },
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

export async function createSection(
  data: CreateSectionInput
) {
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

export async function updateSection(
  id: string,
  data: UpdateSectionInput
) {
  return prisma.customSection.update({
    where: { id },
    data: {
      ...data,
      type: data.type as any,
    },
  });
}

export async function deleteSection(id: string) {
  return prisma.customSection.delete({
    where: { id },
  });
}

/* =====================================================
   CUSTOM SECTION ITEMS
===================================================== */

export async function getSectionItemById(id: string) {
  return prisma.customSectionItem.findUnique({
    where: { id },
  });
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

export async function createSectionItem(
  data: CreateSectionItemInput
) {
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

export async function updateSectionItem(
  id: string,
  data: UpdateSectionItemInput
) {
  return prisma.customSectionItem.update({
    where: { id },
    data,
  });
}

export async function deleteSectionItem(id: string) {
  return prisma.customSectionItem.delete({
    where: { id },
  });
}

/* =====================================================
   PAGE BUILDER
===================================================== */

interface UpdatePageContentInput {
  title?: string;
  subtitle?: string;
  slug?: string;
  isActive?: boolean;
  sections: {
    type: SectionType;
    title?: string;
    subtitle?: string;
    order: number;
    config?: Prisma.InputJsonValue;
    items?: {
      title: string;
      description?: string;
      image?: string;
      icon?: string;
      link?: string;
      order: number;
      config?: Prisma.InputJsonValue;
    }[];
  }[];
}

export async function updateCustomPageContent(
  pageId: string,
  data: UpdatePageContentInput
) {
  return prisma.$transaction(async (tx) => {
    await tx.customPage.update({
      where: { id: pageId },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        slug: data.slug,
        isActive: data.isActive,
      },
    });

    await tx.customSection.deleteMany({
      where: {
        pageId,
      },
    });

    for (const section of data.sections) {
      const createdSection = await tx.customSection.create({
        data: {
          pageId,
          type: section.type as any,
          title: section.title,
          subtitle: section.subtitle,
          order: section.order,
          config: section.config,
        },
      });

      if (section.items?.length) {
        await tx.customSectionItem.createMany({
          data: section.items.map((item) => ({
            sectionId: createdSection.id,
            title: item.title,
            description: item.description,
            image: item.image,
            icon: item.icon,
            link: item.link,
            order: item.order,
            config: item.config,
          })),
        });
      }
    }

    return tx.customPage.findUnique({
      where: {
        id: pageId,
      },
      include: {
        sections: {
          include: {
            items: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  });
}