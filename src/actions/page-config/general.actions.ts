"use server";

import { prisma } from "@/lib/prisma";

export async function getPageConfig() {
  try {
    const pageConfig =
      await prisma.pageConfig.findUnique({
        where: { id: 1 },
      });

    return {
      ok: true,
      pageConfig,
    };
  } catch {
    return {
      ok: false,
      error:
        "Error configuración",
    };
  }
}