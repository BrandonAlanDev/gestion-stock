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
    await prisma.$transaction(async (tx) => {
      // 1. Borramos todos los talles que pertenecen a este grupo
      await tx.size.deleteMany({
        where: { sizeTypeId: id },
      });

      // 2. Borramos el grupo de talles
      await tx.sizeType.delete({
        where: { id },
      });
    });

    revalidatePath("/dashboard/sizes");
    return { success: true };
  } catch (error) {
    console.error(error);
    // Este error suele darse si el Grupo de Talles está vinculado a una CATEGORÍA activa
    return { 
      error: "No se puede eliminar: El grupo está siendo usado por una Categoría." 
    };
  }
}
