"use server";

import { prisma } from "@/lib/prisma";
import { DEFAULT_VALUES } from "./defaults";

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
          storeName: DEFAULT_VALUES.storeName,
          primaryColor: DEFAULT_VALUES.primaryColor,
          secondaryColor: DEFAULT_VALUES.secondaryColor,
        },
      });
  }

  return pageConfig;
}