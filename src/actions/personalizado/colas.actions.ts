"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { obtenerTenantAdministrador } from "@/actions/personalizado/obtener-tenant-administrador";

export async function crearColaTabla(data: { name: string; svgPath?: string }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const created = await prisma.boardTailOption.create({ data: { tenantId, name: data.name, svgPath: data.svgPath || null } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Error al crear la cola." };
  }
}

export async function actualizarColaTabla(id: string, data: { name: string; svgPath?: string; active: boolean }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const resultado = await prisma.boardTailOption.updateMany({
      where: { id, tenantId },
      data: { name: data.name, svgPath: data.svgPath || null, active: data.active },
    });
    if (resultado.count === 0) throw new Error("Cola no encontrada.");
    const updated = await prisma.boardTailOption.findFirstOrThrow({ where: { id, tenantId } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Error al actualizar la cola." };
  }
}

export async function eliminarColaTabla(id: string) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const resultado = await prisma.boardTailOption.deleteMany({ where: { id, tenantId } });
    if (resultado.count === 0) throw new Error("Cola no encontrada.");
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar la cola. (Quizás está en uso)" };
  }
}
