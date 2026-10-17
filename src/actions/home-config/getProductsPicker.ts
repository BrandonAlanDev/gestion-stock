"use server";

import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getProductsPicker() {
  const { tenantId } = await requiereAdmin();
  try {
    const products = await conPrismaTenant(tenantId, (prisma) =>
      prisma.garment.findMany({
        where: {},
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    );

    return products;
  } catch (error) {
    console.error("Error cargando productos:", error);
    return [];
  }
}
