"use server";

import { conPrisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getProductsPicker() {
  await requiereAdmin();
  try {
    const products = await conPrisma((prisma) =>
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
