"use server";

import { prisma } from "@/lib/prisma";

export async function getProductsPicker() {
  try {
    const products = await prisma.garment.findMany({
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