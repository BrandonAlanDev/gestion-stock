"use server";

import prisma from "@/lib/prisma"; // Asegúrate de que la ruta a tu cliente de prisma sea correcta
import { revalidatePath } from "next/cache";

/**
 * Obtener todos los proveedores
 */
export async function getProviders() {
  try {
    const providers = await prisma.provider.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return providers;
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return [];
  }
}

/**
 * Crear un nuevo proveedor
 */
export async function createProvider(data: { name: string; contactInfo?: string }) {
  try {
    if (!data.name) return { error: "el nombre es obligatorio" };

    const newProvider = await prisma.provider.create({
      data: {
        name: data.name,
        contactInfo: data.contactInfo,
        active: true,
      },
    });

    revalidatePath("/dashboard/providers");
    revalidatePath("/dashboard"); // Para actualizar el select en el modal de productos
    return { success: true, provider: newProvider };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Ya existe un proveedor con ese nombre" };
    }
    return { error: "Error al crear el proveedor" };
  }
}

/**
 * Actualizar un proveedor existente
 */
export async function updateProvider(id: string, data: { name: string; contactInfo?: string }) {
  try {
    const updatedProvider = await prisma.provider.update({
      where: { id },
      data: {
        name: data.name,
        contactInfo: data.contactInfo,
      },
    });

    revalidatePath("/dashboard/providers");
    revalidatePath("/dashboard");
    return { success: true, provider: updatedProvider };
  } catch (error) {
    return { error: "Error al actualizar el proveedor" };
  }
}

/**
 * Eliminar (o desactivar) un proveedor
 */
export async function deleteProvider(id: string) {
  try {
    // Nota: Si el proveedor tiene productos asociados, Prisma dará error por la relación.
    // Podrías usar un delete o un update para marcar como active: false.
    await prisma.provider.delete({
      where: { id },
    });

    revalidatePath("/dashboard/providers");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    // Error P2003 es restricción de llave foránea (tiene productos)
    if (error.code === 'P2003') {
      return { error: "No se puede eliminar: este proveedor tiene productos asociados" };
    }
    return { error: "Error al eliminar el proveedor" };
  }
}