"use server";

import { prisma } from "@/lib/prisma";

export async function getCustomPages() {
  return prisma.customPage.findMany({
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
  return prisma.customPage.findUnique({
    where: { id },
    include: {
      sections: {
        include: { items: true },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getCustomPageBySlug(slug: string) {
  return prisma.customPage.findUnique({
    where: { slug },
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
  return prisma.customPage.create({ data });
}

interface UpdateCustomPageInput {
  slug?: string;
  title?: string;
  subtitle?: string | null;
  isActive?: boolean;
}

export async function updateCustomPage(id: string, data: UpdateCustomPageInput) {
  return prisma.customPage.update({ where: { id }, data });
}

export async function deleteCustomPage(id: string) {
  return prisma.customPage.delete({ where: { id } });
}
