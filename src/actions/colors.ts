"use server";
import { revalidatePath } from "next/cache";
import { getCachedColors } from "@/lib/cache";
import * as colorService from "@/lib/services/color-service";

export const getColors = getCachedColors;

export async function createColor(name: string, hex?: string) {
  try {
    const newColor = await colorService.createColor(name, hex);
    revalidatePath("/dashboard/colors");
    return { success: true, data: newColor };
  } catch (error) {
    return { error: "Error al crear el color o ya existe el nombre." };
  }
}