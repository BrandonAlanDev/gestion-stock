"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { obtenerTenantAdministrador } from "@/actions/personalizado/obtener-tenant-administrador";

export async function crearOpcionEntrega(data: { label: string; description?: string }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const created = await prisma.boardDeliveryOption.create({
      data: { tenantId, label: data.label, description: data.description || null },
    });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Error al crear la opción de entrega." };
  }
}

export async function actualizarOpcionEntrega(
  id: string,
  data: { label: string; description?: string; active: boolean }
) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const resultado = await prisma.boardDeliveryOption.updateMany({
      where: { id, tenantId },
      data: { label: data.label, description: data.description || null, active: data.active },
    });
    if (resultado.count === 0) throw new Error("Opción de entrega no encontrada.");
    const updated = await prisma.boardDeliveryOption.findFirstOrThrow({ where: { id, tenantId } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Error al actualizar la opción de entrega." };
  }
}

export async function eliminarOpcionEntrega(id: string) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const resultado = await prisma.boardDeliveryOption.deleteMany({ where: { id, tenantId } });
    if (resultado.count === 0) throw new Error("Opción de entrega no encontrada.");
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar la opción de entrega." };
  }
}
