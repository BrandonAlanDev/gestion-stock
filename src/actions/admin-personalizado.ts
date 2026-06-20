"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* =========================================
   OBTENER TODAS LAS OPCIONES
========================================= */
export async function getBoardAdminOptions() {
  try {
    const [types, tails, fins, configs, materials] = await Promise.all([
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
    ]);

    return { success: true, data: { types, tails, fins, configs, materials } };
  } catch (error: any) {
    console.error("Error fetching admin board options:", error);
    return { success: false, error: "Error al cargar las opciones" };
  }
}

/* =========================================
   TIPOS DE TABLA (Modelos)
========================================= */
export async function createBoardType(data: { name: string; svgPath?: string; tailIds: string[]; finIds: string[]; configIds: string[] }) {
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
  } catch (error: any) {
    console.error(error);
    return { success: false, error: "Error al crear el modelo de tabla." };
  }
}

export async function updateBoardType(id: string, data: { name: string; svgPath?: string; active: boolean; tailIds: string[]; finIds: string[]; configIds: string[] }) {
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
  } catch (error: any) {
    console.error(error);
    return { success: false, error: "Error al actualizar el modelo de tabla." };
  }
}

export async function deleteBoardType(id: string) {
  try {
    await prisma.boardTypeOption.delete({ where: { id } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: "Error al eliminar el modelo de tabla." };
  }
}

/* =========================================
   COLAS (Tails)
========================================= */
export async function createBoardTail(data: { name: string; svgPath?: string }) {
  try {
    const created = await prisma.boardTailOption.create({ data: { name: data.name, svgPath: data.svgPath || null } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch (error) {
    return { success: false, error: "Error al crear la cola." };
  }
}

export async function updateBoardTail(id: string, data: { name: string; svgPath?: string; active: boolean }) {
  try {
    const updated = await prisma.boardTailOption.update({
      where: { id },
      data: { name: data.name, svgPath: data.svgPath || null, active: data.active },
    });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Error al actualizar la cola." };
  }
}

export async function deleteBoardTail(id: string) {
  try {
    await prisma.boardTailOption.delete({ where: { id } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar la cola. (Quizás está en uso)" };
  }
}

/* =========================================
   QUILLAS (Fins)
========================================= */
export async function createBoardFin(data: { name: string }) {
  try {
    const created = await prisma.boardFinOption.create({ data: { name: data.name } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch (error) {
    return { success: false, error: "Error al crear el tipo de quilla." };
  }
}

export async function updateBoardFin(id: string, data: { name: string; active: boolean }) {
  try {
    const updated = await prisma.boardFinOption.update({ where: { id }, data: { name: data.name, active: data.active } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Error al actualizar la quilla." };
  }
}

export async function deleteBoardFin(id: string) {
  try {
    await prisma.boardFinOption.delete({ where: { id } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar la quilla." };
  }
}

/* =========================================
   CONFIGS QUILLAS (Fin Configs)
========================================= */
export async function createBoardFinConfig(data: { name: string; count: number }) {
  try {
    const created = await prisma.boardFinConfigOption.create({ data: { name: data.name, count: data.count } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch (error) {
    return { success: false, error: "Error al crear configuración de quilla." };
  }
}

export async function updateBoardFinConfig(id: string, data: { name: string; count: number; active: boolean }) {
  try {
    const updated = await prisma.boardFinConfigOption.update({ where: { id }, data: { name: data.name, count: data.count, active: data.active } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Error al actualizar configuración de quilla." };
  }
}

export async function deleteBoardFinConfig(id: string) {
  try {
    await prisma.boardFinConfigOption.delete({ where: { id } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar configuración." };
  }
}

/* =========================================
   MATERIALES
========================================= */
export async function createBoardMaterial(data: { name: string; description?: string }) {
  try {
    const created = await prisma.boardMaterialOption.create({ data: { name: data.name, description: data.description || null } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch (error) {
    return { success: false, error: "Error al crear el material." };
  }
}

export async function updateBoardMaterial(id: string, data: { name: string; description?: string; active: boolean }) {
  try {
    const updated = await prisma.boardMaterialOption.update({ where: { id }, data: { name: data.name, description: data.description || null, active: data.active } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Error al actualizar el material." };
  }
}

export async function deleteBoardMaterial(id: string) {
  try {
    await prisma.boardMaterialOption.delete({ where: { id } });
    revalidatePath("/admin/personalizado");
    revalidatePath("/personalizado");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar el material." };
  }
}
