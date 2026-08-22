"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { moduloHabilitado } from "@/lib/modulos/modulo-habilitado";

const moduloActivo = () => moduloHabilitado("personalizadoEnabled");
const ERROR_MODULO = "El módulo de tablas personalizadas está desactivado.";

/* =========================================
   OBTENER TODAS LAS OPCIONES
========================================= */
export async function getBoardAdminOptions() {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    const [types, tails, fins, configs, materials, deliveryOptions] = await Promise.all([
      prisma.boardTypeOption.findMany({
        include: {
          allowedTails: true,
          allowedFins: true,
          allowedConfigs: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.boardTailOption.findMany({ orderBy: { name: "asc" } }),
      prisma.boardFinOption.findMany({ orderBy: { name: "asc" } }),
      prisma.boardFinConfigOption.findMany({ orderBy: { count: "asc" } }),
      prisma.boardMaterialOption.findMany({ orderBy: { name: "asc" } }),
      prisma.boardDeliveryOption.findMany({ orderBy: { createdAt: "asc" } }),
    ]);

    return { success: true, data: { types, tails, fins, configs, materials, deliveryOptions } };
  } catch (error) {
    console.error("Error fetching admin board options:", error);
    return { success: false, error: "Error al cargar las opciones" };
  }
}

/* =========================================
   TIPOS DE TABLA (Modelos)
========================================= */
export async function createBoardType(data: { name: string; svgPath?: string; tailIds: string[]; finIds: string[]; configIds: string[] }) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    const created = await prisma.boardTypeOption.create({
      data: {
        name: data.name,
        svgPath: data.svgPath || null,
        allowedTails: { connect: data.tailIds.map(id => ({ id })) },
        allowedFins: { connect: data.finIds.map(id => ({ id })) },
        allowedConfigs: { connect: data.configIds.map(id => ({ id })) },
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

export async function updateBoardType(id: string, data: { name: string; svgPath?: string; active: boolean; tailIds: string[]; finIds: string[]; configIds: string[] }) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    const updated = await prisma.boardTypeOption.update({
      where: { id },
      data: {
        name: data.name,
        svgPath: data.svgPath || null,
        active: data.active,
        allowedTails: { set: data.tailIds.map(tid => ({ id: tid })) },
        allowedFins: { set: data.finIds.map(fid => ({ id: fid })) },
        allowedConfigs: { set: data.configIds.map(cid => ({ id: cid })) },
      },
    });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al actualizar el modelo de tabla." };
  }
}

export async function deleteBoardType(id: string) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    await prisma.boardTypeOption.delete({ where: { id } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al eliminar el modelo de tabla." };
  }
}

/* =========================================
   COLAS (Tails)
========================================= */
export async function createBoardTail(data: { name: string; svgPath?: string }) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    const created = await prisma.boardTailOption.create({ data: { name: data.name, svgPath: data.svgPath || null } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Error al crear la cola." };
  }
}

export async function updateBoardTail(id: string, data: { name: string; svgPath?: string; active: boolean }) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    const updated = await prisma.boardTailOption.update({
      where: { id },
      data: { name: data.name, svgPath: data.svgPath || null, active: data.active },
    });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Error al actualizar la cola." };
  }
}

export async function deleteBoardTail(id: string) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    await prisma.boardTailOption.delete({ where: { id } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar la cola. (Quizás está en uso)" };
  }
}

/* =========================================
   QUILLAS (Fins)
========================================= */
export async function createBoardFin(data: { name: string }) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    const created = await prisma.boardFinOption.create({ data: { name: data.name } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Error al crear el tipo de quilla." };
  }
}

export async function updateBoardFin(id: string, data: { name: string; active: boolean }) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    const updated = await prisma.boardFinOption.update({ where: { id }, data: { name: data.name, active: data.active } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Error al actualizar la quilla." };
  }
}

export async function deleteBoardFin(id: string) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    await prisma.boardFinOption.delete({ where: { id } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar la quilla." };
  }
}

/* =========================================
   CONFIGS QUILLAS (Fin Configs)
========================================= */
export async function createBoardFinConfig(data: { name: string; count: number }) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    const created = await prisma.boardFinConfigOption.create({ data: { name: data.name, count: data.count } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Error al crear configuración de quilla." };
  }
}

export async function updateBoardFinConfig(id: string, data: { name: string; count: number; active: boolean }) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    const updated = await prisma.boardFinConfigOption.update({ where: { id }, data: { name: data.name, count: data.count, active: data.active } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Error al actualizar configuración de quilla." };
  }
}

export async function deleteBoardFinConfig(id: string) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    await prisma.boardFinConfigOption.delete({ where: { id } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar configuración." };
  }
}

/* =========================================
   MATERIALES
========================================= */
export async function createBoardMaterial(data: { name: string; description?: string }) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    const created = await prisma.boardMaterialOption.create({ data: { name: data.name, description: data.description || null } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Error al crear el material." };
  }
}

export async function updateBoardMaterial(id: string, data: { name: string; description?: string; active: boolean }) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    const updated = await prisma.boardMaterialOption.update({ where: { id }, data: { name: data.name, description: data.description || null, active: data.active } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Error al actualizar el material." };
  }
}

export async function deleteBoardMaterial(id: string) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    await prisma.boardMaterialOption.delete({ where: { id } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar el material." };
  }
}

/* =========================================
   OPCIONES DE ENTREGA
========================================= */
export async function createDeliveryOption(data: { label: string; description?: string }) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    const created = await prisma.boardDeliveryOption.create({
      data: { label: data.label, description: data.description || null },
    });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Error al crear la opción de entrega." };
  }
}

export async function updateDeliveryOption(
  id: string,
  data: { label: string; description?: string; active: boolean }
) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    const updated = await prisma.boardDeliveryOption.update({
      where: { id },
      data: { label: data.label, description: data.description || null, active: data.active },
    });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Error al actualizar la opción de entrega." };
  }
}

export async function deleteDeliveryOption(id: string) {
  if (!(await moduloActivo())) return { success: false, error: ERROR_MODULO };
  try {
    await prisma.boardDeliveryOption.delete({ where: { id } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar la opción de entrega." };
  }
}
