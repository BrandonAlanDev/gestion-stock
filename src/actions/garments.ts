"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { garmentSchema, categorySchema, movementSchema } from "@/lib/zod"; 
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";

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
        name: data.name,
        price: data.price,
        cost: data.cost, // <-- Guardamos el costo
        description: data.description,
        categoryId: data.categoryId,
        supplierId: data.supplierId || null,
        variants: {
          create: data.variants.map((v: any) => ({
            sku: v.sku,
            stock: v.stock,
            sizeId: v.sizeId,
          })),
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

export async function getGarments(query?: string, categoryId?: string) {
  const garments = await prisma.garment.findMany({
    where: {
      active: true,
      AND: [
        // Filtro por búsqueda de texto
        query ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { variants: { some: { sku: { contains: query, mode: 'insensitive' } } } },
          ]
        } : {},
        // Filtro por categoría (NUEVO)
        categoryId ? { categoryId: categoryId } : {},
      ]
    },
    include: { 
      category: true, 
      variants: { include: { size: true } },
      supplier: true 
    },
    orderBy: { updatedAt: 'desc' }
  });
  
  return serializeData(garments);
}

export async function updateGarment(id: string, data: any) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const { name, price, cost, description, categoryId, supplierId, variants } = data;

  try {
    const updatedGarment = await prisma.$transaction(async (tx) => {
      // 1. Actualización de datos básicos (Prisma castea strings a Decimal automáticamente)
      const garment = await tx.garment.update({
        where: { id },
        data: {
          name,
          price: price,
          cost: cost,
          description,
          categoryId,
          supplierId: supplierId || null,
        },
      });

      // 2. Sincronización de Variantes
      const currentVariants = await tx.garmentVariant.findMany({
        where: { garmentId: id },
      });

      const currentVariantIds = currentVariants.map((v) => v.id);
      const incomingVariantIds = variants
        .filter((v: any) => v.id)
        .map((v: any) => v.id);

      // A. Eliminar las que ya no están
      const idsToDelete = currentVariantIds.filter(
        (vid) => !incomingVariantIds.includes(vid)
      );
      if (idsToDelete.length > 0) {
        await tx.garmentVariant.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      // B. Actualizar existentes o Crear nuevas
      for (const v of variants) {
        if (v.id) {
          await tx.garmentVariant.update({
            where: { id: v.id },
            data: {
              sku: v.sku,
              stock: Number(v.stock),
              sizeId: v.sizeId,
            },
          });
        } else {
          await tx.garmentVariant.create({
            data: {
              garmentId: id,
              sku: v.sku,
              stock: Number(v.stock),
              sizeId: v.sizeId,
            },
          });
        }
      }
      return garment;
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeData(updatedGarment) };
  } catch (error: any) {
    console.error("Error:", error);
    if (error.code === 'P2002') return { error: "El SKU ya existe." };
    return { error: "Error al actualizar el producto." };
  }
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

export async function getCategories() {
  return await prisma.category.findMany({
    // Incluimos el sizeType para saber qué talles tiene asignados
    include: { sizeType: true },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(formData: { name: string; description?: string; sizeTypeId?: string }) {
  try {
    await prisma.category.create({
      data: {
        name: formData.name,
        description: formData.description,
        sizeTypeId: formData.sizeTypeId || null, // Asignamos el ID del talle
      },
    });
    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error) {
    return { error: "Error al crear categoría" };
  }
}

export async function updateCategory(id: string, data: { name: string; description?: string; sizeTypeId?: string }) {
  try {
    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        // Permitimos actualizar el grupo de talles o quitarlo
        sizeTypeId: data.sizeTypeId || null,
      },
    });
    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return { error: "Error al actualizar los datos." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath("/dashboard");
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
        details: true,
      }
    });

    return serializeData(providers);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return []; // Retornamos un array vacío para que el modal no rompa
  }
}