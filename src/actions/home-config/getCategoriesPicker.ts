"use server";

import { conPrisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getCategoriesPicker() {
  await requiereAdmin();
  try {
    const categories = await conPrisma((prisma) =>
      prisma.category.findMany({
        where: {},
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    );

    return categories;
  } catch (error) {
    console.error("Error cargando categorías:", error);
    return [];
  }
}
