"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { obtenerTenantAdministrador } from "@/actions/personalizado/obtener-tenant-administrador";

export async function crearConfiguracionQuillas(data: { name: string; count: number }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const created = await prisma.boardFinConfigOption.create({ data: { tenantId, name: data.name, count: data.count } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Error al crear configuración de quilla." };
  }
}

export async function actualizarConfiguracionQuillas(id: string, data: { name: string; count: number; active: boolean }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const resultado = await prisma.boardFinConfigOption.updateMany({ where: { id, tenantId }, data: { name: data.name, count: data.count, active: data.active } });
    if (resultado.count === 0) throw new Error("Configuración no encontrada.");
    const updated = await prisma.boardFinConfigOption.findFirstOrThrow({ where: { id, tenantId } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Error al actualizar configuración de quilla." };
  }
}

export async function eliminarConfiguracionQuillas(id: string) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const resultado = await prisma.boardFinConfigOption.deleteMany({ where: { id, tenantId } });
    if (resultado.count === 0) throw new Error("Configuración no encontrada.");
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar configuración." };
  }
}
