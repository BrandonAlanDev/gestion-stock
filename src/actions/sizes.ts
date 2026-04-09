"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSizeTypes() {
  return await prisma.sizeType.findMany({
    include: { sizes: { orderBy: { order: "asc" } } },
    orderBy: { name: "asc" }
  });
}

export async function createSizeType(name: string) {
  try {
    await prisma.sizeType.create({ data: { name } });
    revalidatePath("/dashboard/sizes");
    return { success: true };
  } catch (error) {
    return { error: "Error al crear el grupo" };
  }
}

export async function addSizeToType(sizeTypeId: string, value: string, order: number) {
  try {
    await prisma.size.create({
      data: { value, order, sizeTypeId }
    });
    revalidatePath("/dashboard/sizes");
    return { success: true };
  } catch (error) {
    return { error: "Error al añadir talle" };
  }
}

export async function deleteSize(id: string) {
  try {
    await prisma.size.delete({ where: { id } });
    revalidatePath("/dashboard/sizes");
    return { success: true };
  } catch (error) {
    return { error: "No se puede borrar: talle en uso" };
  }
}

export async function deleteSizeType(id: string) {
  try {
    await prisma.sizeType.delete({ where: { id } });
    revalidatePath("/dashboard/sizes");
    return { success: true };
  } catch (error) {
    return { error: "El grupo contiene talles o está vinculado" };
  }
}