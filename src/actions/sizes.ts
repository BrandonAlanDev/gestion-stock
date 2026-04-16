"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {SizeTypeNameSchema,SizeValueSchema} from "@/lib/zod";

export async function getSizeTypes() {
  return await prisma.sizeType.findMany({
    include: { sizes: { orderBy: { order: "asc" } } },
    orderBy: { name: "asc" }
  });
}

export async function createSizeType(name: string) {
  const validateFields = SizeTypeNameSchema.safeParse({ name });
  
  if (!validateFields.success) {
    return { error: validateFields.error.flatten().fieldErrors.name?.[0] };
  }

  try {
    await prisma.sizeType.create({ data: { name: validateFields.data.name } });
    revalidatePath("/dashboard/sizes");
    return { success: true };
  } catch (error) {
    return { error: "Error al crear el grupo" };
  }
}

export async function addSizeToType(sizeTypeId: string, value: string, order: number) {
  const validateValue = SizeValueSchema.safeParse(value);
  
  if (!validateValue.success) {
    // Si falla, extraemos el mensaje de forma ultra-segura
    const firstError = validateValue.error?.issues?.[0]?.message 
                    || "Valor de talle inválido";
                    
    return { error: firstError };
  }

  try {
    await prisma.size.create({
      data: { 
        value: validateValue.data.toUpperCase(), 
        order: Number(order), // Aseguramos que sea número
        sizeTypeId 
      }
    });
    revalidatePath("/dashboard/sizes");
    return { success: true };
  } catch (error) {
    console.error("Error Prisma:", error);
    return { error: "Error al guardar en la base de datos" };
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