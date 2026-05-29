"use server";
import { revalidatePath } from "next/cache";
import { SizeTypeNameSchema, SizeValueSchema } from "@/lib/zod";
import { getCachedSizeTypes } from "@/lib/cache";
import * as sizeService from "@/lib/services/size-service";

export const getSizeTypes = getCachedSizeTypes;

export async function createSizeType(name: string) {
  const validateFields = SizeTypeNameSchema.safeParse({ name });
  if (!validateFields.success) {
    return { error: validateFields.error.flatten().fieldErrors.name?.[0] };
  }
  try {
    await sizeService.createSizeType(validateFields.data.name);
    revalidatePath("/dashboard/sizes");
    return { success: true };
  } catch (error) {
    return { error: "Error al crear el grupo" };
  }
}

export async function addSizeToType(sizeTypeId: string, value: string, order: number) {
  const validateValue = SizeValueSchema.safeParse(value);
  if (!validateValue.success) {
    return { error: validateValue.error?.issues?.[0]?.message || "Valor de talle inválido" };
  }
  try {
    await sizeService.addSize(sizeTypeId, validateValue.data.toUpperCase(), Number(order));
    revalidatePath("/dashboard/sizes");
    return { success: true };
  } catch (error) {
    return { error: "Error al guardar en la base de datos" };
  }
}

export async function deleteSize(id: string) {
  try {
    await sizeService.deleteSize(id);
    revalidatePath("/dashboard/sizes");
    return { success: true };
  } catch (error) {
    return { error: "No se puede borrar: talle en uso" };
  }
}

export async function deleteSizeType(id: string) {
  try {
    await sizeService.deleteSizeType(id);
    revalidatePath("/dashboard/sizes");
    return { success: true };
  } catch (error) {
    return { error: "No se puede eliminar: El grupo está siendo usado por una Categoría." };
  }
}