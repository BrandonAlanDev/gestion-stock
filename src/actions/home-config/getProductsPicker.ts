"use server";

import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getProductsPicker() {
  const { tenantId } = await requiereAdmin();
  try {
    const products = await prisma.garment.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return products;
  } catch (error) {
    console.error("Error cargando productos:", error);
    return [];
  }
}
