"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { garmentSchema, categorySchema, movementSchema } from "@/lib/zod"; 
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";

// ==========================================
// CATEGORÍAS (Se mantiene igual)
// ==========================================
export async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: 'asc' }
  });
  return serializeData(categories);
}

// ==========================================
// PRENDAS / GARMENTS (Modificado para Variantes)
// ==========================================

export async function createGarment(data: any) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  // NOTA: Tu zod 'garmentSchema' ahora debería esperar un array de variantes
  const parsed = garmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.format() };

  const { name, price, description, categoryId, supplierId, variants } = parsed.data;

  try {
    const garment = await prisma.garment.create({
      data: {
        name,
        price,
        description,
        categoryId,
        supplierId,
        // Creación anidada de variantes (talles)
        variants: {
          create: variants.map((v: any) => ({
            sku: v.sku,
            stock: v.stock || 0,
            sizeId: v.sizeId, // ID del talle (ej: ID de "42")
          }))
        }
      }
    });
    revalidatePath("/dashboard");
    return { success: true, data: serializeData(garment) };
  } catch (error) {
    console.error(error);
    return { error: "Error al crear el producto. Revisa si el SKU ya existe." };
  }
}

export async function getGarments(query?: string) {
  const garments = await prisma.garment.findMany({
    where: {
      active: true,
      ...(query ? {
        OR: [
          { name: { contains: query } },
          { variants: { some: { sku: { contains: query } } } }, // Busca por SKU dentro de las variantes
          { category: { name: { contains: query } } }
        ]
      } : {})
    },
    include: { 
      category: true, 
      variants: { include: { size: true } }, // Incluimos los talles y stock
      supplier: true 
    },
    orderBy: { updatedAt: 'desc' }
  });
  
  return serializeData(garments);
}

// ==========================================
// MOVIMIENTOS (Modificado: Ahora afecta a GarmentVariant)
// ==========================================

export async function createMovement(data: unknown) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const parsed = movementSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.format() };

  // variantId es el ID del talle específico de esa zapatilla
  const { variantId, type, quantity, note } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Buscamos la variante y el precio del producto padre
      const variant = await tx.garmentVariant.findUnique({
        where: { id: variantId },
        include: { garment: { select: { price: true } } }
      });

      if (!variant) throw new Error("Variante (talle) no encontrada");
      if (type === "OUT" && variant.stock < quantity) {
        throw new Error("Stock insuficiente en este talle");
      }

      // 2. Creamos el movimiento vinculado a la variante
      await tx.movement.create({
        data: {
          variantId,
          type,
          quantity,
          priceAtTime: variant.garment.price,
          note
        }
      });

      // 3. Actualizamos el stock en la tabla GarmentVariant
      const stockAdjustment = type === "IN" ? quantity : -quantity;
      await tx.garmentVariant.update({
        where: { id: variantId },
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
    await prisma.$transaction(async (tx) => {
      const movement = await tx.movement.findUnique({ where: { id } });
      if (!movement) throw new Error("Movimiento no encontrado");

      // Revertimos el stock en la variante
      const stockAdjustment = movement.type === "IN" ? -movement.quantity : movement.quantity;
      
      await tx.garmentVariant.update({
        where: { id: movement.variantId },
        data: { stock: { increment: stockAdjustment } }
      });

      await tx.movement.delete({ where: { id } });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: "Error al eliminar el movimiento." };
  }
}

// Auxiliar para traer los talles disponibles en la base de datos
export async function getSizes() {
  const sizes = await prisma.size.findMany({
    where: { active: true },
    orderBy: { order: 'asc' }
  });
  return serializeData(sizes);
}

// ==========================================
// CATEGORÍAS (Funciones faltantes para la gestión)
// ==========================================

export async function createCategory(data: any) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return { error: "Datos de categoría inválidos" };

  try {
    const category = await prisma.category.create({
      data: parsed.data,
    });
    revalidatePath("/dashboard/categories");
    return { success: true, data: serializeData(category) };
  } catch (error) {
    return { error: "Error al crear la categoría" };
  }
}

export async function updateCategory(id: string, data: any) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return { error: "Datos inválidos" };

  try {
    await prisma.category.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error) {
    return { error: "Error al actualizar la categoría" };
  }
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  try {
    // Verificamos si tiene productos antes de borrar (opcional, Prisma lanzará error si hay relación)
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error) {
    return { error: "No se puede eliminar la categoría porque tiene productos asociados." };
  }
}
// ==========================================
// PROVEEDORES
// ==========================================

export async function getProviders() {
  try {
    const providers = await prisma.provider.findMany({
      where: { 
        active: true 
      },
      orderBy: { 
        name: 'asc' 
      },
      // Si solo necesitas el ID y el Nombre para el modal, 
      // puedes usar select para que la consulta sea más liviana:
      select: {
        id: true,
        name: true,
        contactInfo: true,
      }
    });

    return serializeData(providers);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return []; // Retornamos un array vacío para que el modal no rompa
  }
}