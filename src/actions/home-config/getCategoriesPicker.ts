"use server";

import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getCategoriesPicker() {
  const { tenantId } = await requiereAdmin();
  try {
    const categories = await conPrismaTenant(tenantId, (prisma) =>
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
