"use server";

import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getCategoriesPicker() {
  const { tenantId } = await requiereAdmin();
  try {
    const categories = await prisma.category.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories;
  } catch (error) {
    console.error("Error cargando categorías:", error);
    return [];
  }
}
