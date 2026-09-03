"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { moduloHabilitado } from "@/lib/modulos/modulo-habilitado";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

const moduloActivo = (tenantId: string) => moduloHabilitado(tenantId, "personalizadoEnabled");
const ERROR_MODULO = "El módulo de tablas personalizadas está desactivado.";

async function obtenerTenantAdministrador() {
  const { tenantId } = await requiereAdmin();
  if (!(await moduloActivo(tenantId))) throw new Error(ERROR_MODULO);
  return tenantId;
}

async function validarRelacionesModelo(
  tenantId: string,
  datos: { tailIds: string[]; finIds: string[]; configIds: string[] }
) {
  const tailIds = [...new Set(datos.tailIds)];
  const finIds = [...new Set(datos.finIds)];
  const configIds = [...new Set(datos.configIds)];
  const [colas, quillas, configuraciones] = await Promise.all([
    prisma.boardTailOption.count({ where: { tenantId, id: { in: tailIds } } }),
    prisma.boardFinOption.count({ where: { tenantId, id: { in: finIds } } }),
    prisma.boardFinConfigOption.count({ where: { tenantId, id: { in: configIds } } }),
  ]);
  if (colas !== tailIds.length || quillas !== finIds.length || configuraciones !== configIds.length) {
    throw new Error("Una opción relacionada no pertenece a esta tienda.");
  }
  return { tailIds, finIds, configIds };
}

/* =========================================
   OBTENER TODAS LAS OPCIONES
========================================= */
export async function getBoardAdminOptions() {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const [types, tails, fins, configs, materials, deliveryOptions] = await Promise.all([
      prisma.boardTypeOption.findMany({
        where: { tenantId },
        include: {
          typeTails: { where: { tenantId }, include: { tail: true } },
          typeFins: { where: { tenantId }, include: { fin: true } },
          typeConfigs: { where: { tenantId }, include: { config: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.boardTailOption.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
      prisma.boardFinOption.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
      prisma.boardFinConfigOption.findMany({ where: { tenantId }, orderBy: { count: "asc" } }),
      prisma.boardMaterialOption.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
      prisma.boardDeliveryOption.findMany({ where: { tenantId }, orderBy: { createdAt: "asc" } }),
    ]);

    const tipos = types.map(({ typeTails, typeFins, typeConfigs, ...tipo }) => ({
      ...tipo,
      allowedTails: typeTails.map((enlace) => enlace.tail),
      allowedFins: typeFins.map((enlace) => enlace.fin),
      allowedConfigs: typeConfigs.map((enlace) => enlace.config),
    }));
    return { success: true, data: { types: tipos, tails, fins, configs, materials, deliveryOptions } };
  } catch (error) {
    console.error("Error fetching admin board options:", error);
    return { success: false, error: "Error al cargar las opciones" };
  }
}

/* =========================================
   TIPOS DE TABLA (Modelos)
========================================= */
export async function createBoardType(data: { name: string; svgPath?: string; tailIds: string[]; finIds: string[]; configIds: string[] }) {
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

export async function updateBoardType(id: string, data: { name: string; svgPath?: string; active: boolean; tailIds: string[]; finIds: string[]; configIds: string[] }) {
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

export async function deleteBoardType(id: string) {
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

/* =========================================
   COLAS (Tails)
========================================= */
export async function createBoardTail(data: { name: string; svgPath?: string }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const created = await prisma.boardTailOption.create({ data: { tenantId, name: data.name, svgPath: data.svgPath || null } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Error al crear la cola." };
  }
}

export async function updateBoardTail(id: string, data: { name: string; svgPath?: string; active: boolean }) {
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

export async function deleteBoardTail(id: string) {
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

/* =========================================
   QUILLAS (Fins)
========================================= */
export async function createBoardFin(data: { name: string }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const created = await prisma.boardFinOption.create({ data: { tenantId, name: data.name } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Error al crear el tipo de quilla." };
  }
}

export async function updateBoardFin(id: string, data: { name: string; active: boolean }) {
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

export async function deleteBoardFin(id: string) {
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

/* =========================================
   CONFIGS QUILLAS (Fin Configs)
========================================= */
export async function createBoardFinConfig(data: { name: string; count: number }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const created = await prisma.boardFinConfigOption.create({ data: { tenantId, name: data.name, count: data.count } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Error al crear configuración de quilla." };
  }
}

export async function updateBoardFinConfig(id: string, data: { name: string; count: number; active: boolean }) {
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

export async function deleteBoardFinConfig(id: string) {
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

/* =========================================
   MATERIALES
========================================= */
export async function createBoardMaterial(data: { name: string; description?: string }) {
  try {
    const tenantId = await obtenerTenantAdministrador();
    const created = await prisma.boardMaterialOption.create({ data: { tenantId, name: data.name, description: data.description || null } });
    revalidatePath("/admin/personalizado");
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Error al crear el material." };
  }
}

export async function updateBoardMaterial(id: string, data: { name: string; description?: string; active: boolean }) {
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

export async function deleteBoardMaterial(id: string) {
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

/* =========================================
   OPCIONES DE ENTREGA
========================================= */
export async function createDeliveryOption(data: { label: string; description?: string }) {
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

export async function updateDeliveryOption(
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

export async function deleteDeliveryOption(id: string) {
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
