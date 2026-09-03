"use server";
import { revalidateTag } from "next/cache";
import { SizeTypeNameSchema, SizeValueSchema } from "@/lib/zod";
import { getCachedSizeTypes } from "@/lib/cache";
import * as sizeService from "@/lib/services/size-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

function revalidarTalles(tenantId: string): void {
  revalidateTag(`tenant:${tenantId}:sizeTypes`);
}
export async function getSizeTypes() {
  const { tenantId } = await requiereAdmin();
  return getCachedSizeTypes(tenantId);
}

// --- GRUPOS DE TALLES (SizeType) ---

export async function createSizeType(name: string) {
  const validateFields = SizeTypeNameSchema.safeParse({ name });
  if (!validateFields.success) {
    return { error: validateFields.error.flatten().fieldErrors.name?.[0] };
  }
  try {
    const { tenantId } = await requiereAdmin();
    await sizeService.createSizeType(tenantId, validateFields.data.name);
    revalidarTalles(tenantId);
    return { success: true };
  } catch {
    return { error: "Error al crear el grupo" };
  }
}

export async function updateSizeType(id: string, name: string) {
  const validateFields = SizeTypeNameSchema.safeParse({ name });
  if (!validateFields.success) {
    return { error: validateFields.error.flatten().fieldErrors.name?.[0] };
  }
  try {
    const { tenantId } = await requiereAdmin();
    await sizeService.updateSizeType(tenantId, id, validateFields.data.name);
    revalidarTalles(tenantId);
    return { success: true };
  } catch {
    return { error: "Error al actualizar el grupo" };
  }
}

export async function deleteSizeType(id: string) {
  try {
    const { tenantId } = await requiereAdmin();
    await sizeService.deleteSizeType(tenantId, id);
    revalidarTalles(tenantId);
    return { success: true };
  } catch {
    return { error: "No se puede eliminar: El grupo está siendo usado por una Categoría." };
  }
}

// --- TALLES (Size) ---

export async function addSizeToType(sizeTypeId: string, value: string, order: number) {
  const validateValue = SizeValueSchema.safeParse(value);
  if (!validateValue.success) {
    return { error: validateValue.error?.issues?.[0]?.message || "Valor de talle inválido" };
  }
  try {
    const { tenantId } = await requiereAdmin();
    await sizeService.addSize(tenantId, sizeTypeId, validateValue.data.toUpperCase(), Number(order));
    revalidarTalles(tenantId);
    return { success: true };
  } catch {
    return { error: "Error al guardar en la base de datos" };
  }
}

export async function updateSize(id: string, value: string, order: number) {
  const validateValue = SizeValueSchema.safeParse(value);
  if (!validateValue.success) {
    return { error: validateValue.error?.issues?.[0]?.message || "Valor de talle inválido" };
  }
  try {
    const { tenantId } = await requiereAdmin();
    await sizeService.updateSize(tenantId, id, validateValue.data.toUpperCase(), Number(order));
    revalidarTalles(tenantId);
    return { success: true };
  } catch {
    return { error: "Error al actualizar el talle" };
  }
}

export async function deleteSize(id: string) {
  try {
    const { tenantId } = await requiereAdmin();
    await sizeService.deleteSize(tenantId, id);
    revalidarTalles(tenantId);
    return { success: true };
  } catch {
    return { error: "No se puede borrar: talle en uso" };
  }
}
