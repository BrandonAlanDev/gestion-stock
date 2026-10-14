"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { obtenerTenantAdministrador } from "@/actions/personalizado/obtener-tenant-administrador";

export async function crearMaterialTabla(data: { name: string; description?: string }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const created = await prisma.boardMaterialOption.create({ data: { tenantId, name: data.name, description: data.description || null } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Error al crear el material." };
  }
}

export async function actualizarMaterialTabla(id: string, data: { name: string; description?: string; active: boolean }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const resultado = await prisma.boardMaterialOption.updateMany({ where: { id, tenantId }, data: { name: data.name, description: data.description || null, active: data.active } });
    if (resultado.count === 0) throw new Error("Material no encontrado.");
    const updated = await prisma.boardMaterialOption.findFirstOrThrow({ where: { id, tenantId } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Error al actualizar el material." };
  }
}

export async function eliminarMaterialTabla(id: string) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const resultado = await prisma.boardMaterialOption.deleteMany({ where: { id, tenantId } });
    if (resultado.count === 0) throw new Error("Material no encontrado.");
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar el material." };
  }
}
