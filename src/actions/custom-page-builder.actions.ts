"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, SectionType as TipoSeccionPrisma } from "../../generated/prisma/client";
import { SectionType } from "./custom-page-sections.actions";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

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
  const { tenantId } = await requiereAdmin();
  const pagina = await prisma.customPage.findFirst({ where: { id: pageId, tenantId }, select: { id: true } });
  if (!pagina) throw new Error("La página no pertenece a la tienda activa");
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

    await tx.customSection.deleteMany({ where: { pageId, tenantId } });

    for (const section of data.sections) {
      const createdSection = await tx.customSection.create({
        data: {
          tenantId,
          pageId,
          type: section.type as TipoSeccionPrisma,
          title: section.title,
          subtitle: section.subtitle,
          order: section.order,
          config: section.config,
        },
      });

      if (section.items?.length) {
        await tx.customSectionItem.createMany({
          data: section.items.map((item) => ({
            tenantId,
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

    return tx.customPage.findFirst({
      where: { id: pageId, tenantId },
      include: {
        sections: {
          include: { items: true },
          orderBy: { order: "asc" },
        },
      },
    });
  });
}
