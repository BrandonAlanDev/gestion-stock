"use server";
import { revalidateTag } from "next/cache";
import { getCachedColors } from "@/lib/cache";
import * as colorService from "@/lib/services/color-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export async function getColors() {
  const { tenantId } = await requiereAdmin();
  return getCachedColors(tenantId);
}
export async function createColor(name: string, hex?: string) {
  try {
    const { tenantId } = await requiereAdmin();
    const newColor = await colorService.createColor(tenantId, name, hex);
    revalidateTag(`tenant:${tenantId}:colors`);
    return { success: true, data: newColor };
  } catch {
    return { error: "Error al crear el color o ya existe el nombre." };
  }
}
