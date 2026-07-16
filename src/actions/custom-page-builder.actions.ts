"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import { SectionType } from "./custom-page-sections.actions";

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

export async function updateCustomPageContent(pageId: string, data: UpdatePageContentInput) {
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

    await tx.customSection.deleteMany({ where: { pageId } });

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
      where: { id: pageId },
      include: {
        sections: {
          include: { items: true },
          orderBy: { order: "asc" },
        },
      },
    });
  });
}
