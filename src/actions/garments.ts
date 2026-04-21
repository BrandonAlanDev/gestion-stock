"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { garmentSchema, categorySchema, movementSchema } from "@/lib/zod"; 
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";
import { color } from "framer-motion";

// ==========================================
// PRENDAS / GARMENTS (Modificado para Variantes)
// ==========================================

export async function createGarment(data: any) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const parsed = garmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.format() };

  const { name, price, description, categoryId, supplierId, variants } = parsed.data;

  try {
    const garment = await prisma.garment.create({
     data: {
        name: data.name,
        price: data.price,
        cost: data.cost,
        description: data.description,
        categoryId: data.categoryId,
        supplierId: data.supplierId || null,
        variants: {
          create: data.variants.map((v: any) => ({
            sku: v.sku,
            stock: v.stock,
            sizeId: v.sizeId,
            colorId: v.colorId || null,
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
        query ? {
          OR: [
            { name: { contains: query, } },
            { variants: { some: { sku: { contains: query, } } } },
          ]
        } : {},
        // Filtro por categoría
        categoryId ? { categoryId: categoryId } : {},
      ]
    },
    include: { 
      category: true, 
      variants: { 
        include: {
           size: true,
           color: true
          } },
      supplier: {
        include: {contacts: {where: {active:true}}}
      }
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
              colorId: v.colorId || null,
            },
          });
        } else {
          await tx.garmentVariant.create({
            data: {
              garmentId: id,
              sku: v.sku,
              stock: Number(v.stock),
              sizeId: v.sizeId,
              colorId: v.colorId || null,
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

export async function deleteGarment(id: string) {
  try {
    // Verificamos si el producto existe antes de intentar borrar
    const existingGarment = await prisma.garment.findUnique({
      where: { id },
      include: { variants: true }
    });

    if (!existingGarment) {
      return { error: "El producto no existe o ya fue eliminado." };
    }

    // Eliminación del producto
    await prisma.garment.delete({
      where: { id },
    });

    // Revalidamos la ruta donde se muestra la tabla para refrescar los datos
    revalidatePath("/dashboard/productos"); 
    
    return { success: true };
  } catch (error: any) {
    console.error("DELETE_GARMENT_ERROR:", error);

    // Manejo de errores específicos de Prisma (opcional)
    if (error.code === 'P2003') {
      return { error: "No se puede eliminar: existen registros vinculados que no permiten el borrado." };
    }

    return { error: "Ocurrió un error inesperado al intentar eliminar el producto." };
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
  try {
    const categories = await prisma.category.findMany({
      where: {
        active: true,
      },
      include: {
        sizeType: {
          include: {
            sizes: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return categories;
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return [];
  }
}

export async function createCategory(formData: { name: string; description?: string; sizeTypeId?: string }) {
  try {
    await prisma.category.create({
      data: {
        name: formData.name,
        description: formData.description,
        sizeTypeId: formData.sizeTypeId, 
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
        sizeTypeId: data.sizeTypeId && data.sizeTypeId !== "" ? data.sizeTypeId : null,
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
      include: {
        contacts: {
          where: { active: true }
        }
      }
    });

    return serializeData(providers);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return []; // Retornamos un array vacío para que el modal no rompa
  }
}