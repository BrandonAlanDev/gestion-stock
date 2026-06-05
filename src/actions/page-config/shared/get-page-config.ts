"use server";

import { prisma } from "@/lib/prisma";

export async function getOrCreatePageConfig() {
  let pageConfig =
    await prisma.pageConfig.findUnique({
      where: { id: 1 },
    });

  if (!pageConfig) {
    pageConfig =
      await prisma.pageConfig.create({
        data: {
          id: 1,
        },
      });
  }

  return pageConfig;
}