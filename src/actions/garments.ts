"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { garmentSchema, categorySchema, movementSchema } from "@/lib/zod"; // Asegúrate de tener estos
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";

// ==========================================
// CATEGORÍAS (Soft Delete)
// ==========================================

export async function createCategory(data: unknown) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.format() };

  try {
    const category = await prisma.category.create({ data: parsed.data });
    revalidatePath("/dashboard");
    return { success: true, data: serializeData(category) };
  } catch (error) {
    return { error: "Error al crear la categoría." };
  }
}

export async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { active: true }, // Solo traemos las activas
    orderBy: { name: 'asc' }
  });
  return serializeData(categories);
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  // Soft Delete: Pasamos active a false
  await prisma.category.update({
    where: { id },
    data: { active: false }
  });
  revalidatePath("/dashboard");
}

export async function updateCategory(id: string, data: unknown) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.format() };

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/dashboard/categories");
    return { success: true, data: serializeData(updated) };
  } catch (error) {
    return { error: "Error al actualizar la categoría" };
  }
}

// ==========================================
// PRENDAS / GARMENTS (Soft Delete)
// ==========================================

export async function createGarment(data: unknown) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const parsed = garmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.format() };

  try {
    const garment = await prisma.garment.create({ data: parsed.data });
    revalidatePath("/dashboard");
    return { success: true, data: serializeData(garment) };
  } catch (error) {
    return { error: "Error al crear el artículo (¿SKU duplicado?)" };
  }
}

export async function getGarments(query?: string) {
  const garments = await prisma.garment.findMany({
    where: {
      active: true, // Filtramos solo los que no están eliminados
      ...(query ? {
        OR: [
          { name: { contains: query } },
          { sku: { contains: query } },
          { category: { name: { contains: query } } } // Buscamos por el nombre de la categoría relacionada
        ]
      } : {})
    },
    include: { category: true }, // Incluimos los datos de la categoría
    orderBy: { updatedAt: 'desc' }
  });
  
  return serializeData(garments);
}

export async function updateGarment(id: string, data: unknown) {
  const session = await auth();
  if (!session) throw new Error("No autorizado");

  const parsed = garmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.format() };

  try {
    await prisma.garment.update({
      where: { id },
      data: parsed.data
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Error al actualizar el producto" };
  }
}

export async function deleteGarment(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  // Soft Delete: Pasamos active a false en lugar de usar .delete()
  await prisma.garment.update({
    where: { id },
    data: { active: false }
  });
  revalidatePath("/dashboard");
}

// ==========================================
// MOVIMIENTOS (Hard Delete y Transacciones)
// ==========================================

export async function createMovement(data: unknown) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const parsed = movementSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.format() };

  const { garmentId, type, quantity, note } = parsed.data;

  try {
    // Usamos una Transacción para asegurar que el movimiento y el stock se actualicen juntos
    await prisma.$transaction(async (tx) => {
      // 1. Buscamos el precio actual de la prenda
      const garment = await tx.garment.findUnique({
        where: { id: garmentId },
        select: { price: true, stock: true }
      });

      if (!garment) throw new Error("Prenda no encontrada");
      if (type === "OUT" && garment.stock < quantity) {
        throw new Error("Stock insuficiente para el egreso");
      }

      // 2. Creamos el movimiento guardando el precio histórico
      await tx.movement.create({
        data: {
          garmentId,
          type,
          quantity,
          priceAtTime: garment.price, // Precio congelado en el tiempo
          note
        }
      });

      // 3. Actualizamos el stock real de la prenda
      const stockAdjustment = type === "IN" ? quantity : -quantity;
      await tx.garment.update({
        where: { id: garmentId },
        data: { stock: { increment: stockAdjustment } }
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al registrar el movimiento" };
  }
}

export async function deleteMovement(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  try {
    // Transacción para revertir el stock antes de hacer el Hard Delete
    await prisma.$transaction(async (tx) => {
      const movement = await tx.movement.findUnique({ where: { id } });
      if (!movement) throw new Error("Movimiento no encontrado");

      // Si fue un IN (ingreso), al borrarlo restamos stock. Si fue OUT, sumamos.
      const stockAdjustment = movement.type === "IN" ? -movement.quantity : movement.quantity;
      
      await tx.garment.update({
        where: { id: movement.garmentId },
        data: { stock: { increment: stockAdjustment } }
      });

      // Hard Delete del movimiento
      await tx.movement.delete({ where: { id } });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: "Error al eliminar el movimiento y revertir el stock." };
  }
}