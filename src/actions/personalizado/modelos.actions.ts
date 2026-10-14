"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { obtenerTenantAdministrador } from "@/actions/personalizado/obtener-tenant-administrador";
import { validarRelacionesModelo } from "@/actions/personalizado/validar-relaciones-modelo";

export async function crearModeloTabla(data: { name: string; svgPath?: string; tailIds: string[]; finIds: string[]; configIds: string[] }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const relaciones = await validarRelacionesModelo(tenantId, data);
    const created = await prisma.boardTypeOption.create({
      data: {
        tenantId,
        name: data.name,
        svgPath: data.svgPath || null,
        typeTails: { create: relaciones.tailIds.map((tailId) => ({ tenantId, tailId })) },
        typeFins: { create: relaciones.finIds.map((finId) => ({ tenantId, finId })) },
        typeConfigs: { create: relaciones.configIds.map((configId) => ({ tenantId, configId })) },
      },
    });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: created };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al crear el modelo de tabla." };
  }
}

export async function actualizarModeloTabla(id: string, data: { name: string; svgPath?: string; active: boolean; tailIds: string[]; finIds: string[]; configIds: string[] }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const relaciones = await validarRelacionesModelo(tenantId, data);
    const updated = await prisma.$transaction(async (tx) => {
      const resultado = await tx.boardTypeOption.updateMany({
        where: { id, tenantId },
        data: { name: data.name, svgPath: data.svgPath || null, active: data.active },
      });
      if (resultado.count === 0) throw new Error("Modelo no encontrado.");
      await Promise.all([
        tx.boardTypeTailOption.deleteMany({ where: { tenantId, boardTypeId: id } }),
        tx.boardTypeFinOption.deleteMany({ where: { tenantId, boardTypeId: id } }),
        tx.boardTypeFinConfigOption.deleteMany({ where: { tenantId, boardTypeId: id } }),
      ]);
      await Promise.all([
        tx.boardTypeTailOption.createMany({ data: relaciones.tailIds.map((tailId) => ({ tenantId, boardTypeId: id, tailId })) }),
        tx.boardTypeFinOption.createMany({ data: relaciones.finIds.map((finId) => ({ tenantId, boardTypeId: id, finId })) }),
        tx.boardTypeFinConfigOption.createMany({ data: relaciones.configIds.map((configId) => ({ tenantId, boardTypeId: id, configId })) }),
      ]);
      return tx.boardTypeOption.findFirstOrThrow({ where: { id, tenantId } });
    });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al actualizar el modelo de tabla." };
  }
}

export async function eliminarModeloTabla(id: string) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const resultado = await prisma.boardTypeOption.deleteMany({ where: { id, tenantId } });
    if (resultado.count === 0) throw new Error("Modelo no encontrado.");
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al eliminar el modelo de tabla." };
  }
}
