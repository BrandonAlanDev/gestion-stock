"use server";

import { prisma } from "@/lib/prisma";
import { serializeData } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getColors() {
  try {
    const colors = await prisma.color.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
    return serializeData(colors);
  } catch (error) {
    console.error("Error al obtener colores:", error);
    return [];
  }
}

export async function createColor(name: string, hex?: string) {
  try {
    const newColor = await prisma.color.create({
      data: { name, hex }
    });
    revalidatePath("/dashboard/colors");
    return { success: true, data: serializeData(newColor) };
  } catch (error) {
    return { error: "Error al crear el color o ya existe el nombre." };
  }
}