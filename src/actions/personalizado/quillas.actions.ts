"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { obtenerTenantAdministrador } from "@/actions/personalizado/obtener-tenant-administrador";

export async function crearQuillaTabla(data: { name: string }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const created = await prisma.boardFinOption.create({ data: { tenantId, name: data.name } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Error al crear el tipo de quilla." };
  }
}

export async function actualizarQuillaTabla(id: string, data: { name: string; active: boolean }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const resultado = await prisma.boardFinOption.updateMany({ where: { id, tenantId }, data: { name: data.name, active: data.active } });
    if (resultado.count === 0) throw new Error("Quilla no encontrada.");
    const updated = await prisma.boardFinOption.findFirstOrThrow({ where: { id, tenantId } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Error al actualizar la quilla." };
  }
}

export async function eliminarQuillaTabla(id: string) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const resultado = await prisma.boardFinOption.deleteMany({ where: { id, tenantId } });
    if (resultado.count === 0) throw new Error("Quilla no encontrada.");
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar la quilla." };
  }
}
