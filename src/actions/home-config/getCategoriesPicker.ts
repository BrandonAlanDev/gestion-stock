"use server";

import { prisma } from "@/lib/prisma";

export async function getCategoriesPicker() {
  try {
    const categories = await prisma.category.findMany({
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