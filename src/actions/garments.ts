"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { garmentSchema, categorySchema, movementSchema } from "@/lib/zod"; 
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CreateSubCategoryInput {
  name: string;
  categoryId: string;
  sizeTypeId: string | null;
}

// ==========================================
// PRENDAS / GARMENTS (Modificado para Variantes y Subcategorías)
// ==========================================

export async function createGarment(data: any) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const parsed = garmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.format() };

  const { 
    name, 
    price, 
    cost, 
    description, 
    categoryId, 
    subCategoryId, 
    supplierId, 
    variants, 
    images 
  } = parsed.data;

  try {
    // 💡 LAS IMÁGENES YA FUERON SUBIDAS POR EL FRONTEND.
    // Solo mapeamos el array de URLs strings que nos envía el cliente al formato de Prisma.
    let mappedImages: { srcImage: string; order: number }[] = [];
    
    if (images && images.length > 0) {
      mappedImages = images.map((url: string, index: number) => ({
        srcImage: url,
        order: index, // Mantiene el orden original (0 será la principal)
      }));
    }

    const garment = await prisma.garment.create({
      data: {
        name,
        price,
        cost,
        description,
        categoryId,
        subCategoryId: subCategoryId || null,
        supplierId: supplierId || null,
        variants: {
          create: variants.map((v: any) => ({
            sku: v.sku || null, // Evita strings vacíos que rompan por UNIQUE
            stock: Number(v.stock),
            sizeId: v.sizeId,
            colorId: v.colorId || null,
          })),
        },
        images: {
          create: mappedImages, // Guardamos la relación en la tabla GarmentImage
        }
      }
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeData(garment) };
    
  } catch (error: any) {
    console.error("❌ Error en createGarment:", error);
    
    // Un extra útil: capturar explícitamente el error de SKU duplicado en Prisma
    if (error.code === 'P2002') {
      return { error: "El SKU ingresado ya pertenece a otra variante activa." };
    }
    
    return { error: "Error interno al crear el producto en la base de datos." };
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
        categoryId ? { categoryId: categoryId } : {},
      ]
    },
    include: { 
      category: true, 
      subCategory: true, // ADAPTADO: Trae también la relación de la subcategoría si la necesitás en las tablas
      variants: { 
        include: {
           size: true,
           color: true
          } },
      supplier: {
        include: {contacts: {where: {active:true}}}
      },
      images: {
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
  
  return serializeData(garments);
}

function extractPublicId(url: string) {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(p => p === 'upload');
    if (uploadIndex !== -1) {
      const pathParts = parts.slice(uploadIndex + 2);
      const fileName = pathParts.join('/');
      return fileName.split('.')[0];
    }
  } catch (e) {
    console.error("Error extracting public ID", e);
  }
  return null;
}

export async function updateGarment(id: string, data: any) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  // ADAPTADO: Extraer subCategoryId desde la data entrante
  const { name, price, cost, description, categoryId, subCategoryId, supplierId, variants, images } = data;

  try {
    const existingImages = await prisma.garmentImage.findMany({ where: { garmentId: id } });
    
    let finalImageRecords: { srcImage: string; order: number }[] = [];
    
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.startsWith("data:image")) {
          const uploadResponse = await cloudinary.uploader.upload(img, {
            folder: "gestion-stock/garments",
          });
          finalImageRecords.push({ srcImage: uploadResponse.secure_url, order: i });
        } else {
          finalImageRecords.push({ srcImage: img, order: i });
        }
      }
    }

    const newUrls = finalImageRecords.map(r => r.srcImage);
    const imagesToDelete = existingImages.filter(img => !newUrls.includes(img.srcImage));

    for (const img of imagesToDelete) {
      const publicId = extractPublicId(img.srcImage);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const updatedGarment = await prisma.$transaction(async (tx) => {
      // 1. Actualización de datos básicos (Incluida subCategoryId)
      const garment = await tx.garment.update({
        where: { id },
        data: {
          name,
          price,
          cost,
          description,
          categoryId,
          subCategoryId: subCategoryId || null, // ADAPTADO: Mapeo de la subcategoría en el update
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

      // C. Sincronización de Imágenes
      await tx.garmentImage.deleteMany({
        where: { garmentId: id }
      });
      if (finalImageRecords.length > 0) {
        await tx.garmentImage.createMany({
          data: finalImageRecords.map(r => ({
            garmentId: id,
            srcImage: r.srcImage,
            order: r.order
          }))
        });
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
    const existingGarment = await prisma.garment.findUnique({
      where: { id },
      include: { variants: true }
    });

    if (!existingGarment) {
      return { error: "El producto no existe o ya fue eliminado." };
    }

    await prisma.garment.delete({
      where: { id },
    });

    revalidatePath("/dashboard/productos"); 
    return { success: true };
  } catch (error: any) {
    console.error("DELETE_GARMENT_ERROR:", error);
    if (error.code === 'P2003') {
      return { error: "No se puede eliminar: existen registros vinculados que no permiten el borrado." };
    }
    return { error: "Ocurrió un error inesperado al intentar eliminar el producto." };
  }
}

export async function getSizes() {
  const sizes = await prisma.size.findMany({
    where: { active: true },
    orderBy: { order: 'asc' }
  });
  return serializeData(sizes);
}

// ==========================================
// CATEGORÍAS Y SUBCATEGORÍAS
// ==========================================
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
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
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return categories;
  } catch (error) {
    console.error("Error al obtener las categorías con talles:", error);
    return [];
  }
}

export async function createCategory(formData: { name: string; description?: string }) {
  try {
    const newCategory = await prisma.category.create({
      data: { name: formData.name },
    });
    revalidatePath("/categories");
    return { success: true, data: newCategory };
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return { error: "Error al crear categoría" };
  }
}

export async function updateCategory(id: string, data: { name: string; description?: string }) {
  try {
    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
    revalidatePath("/categories");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return { error: "Error al actualizar los datos." };
  }
}

export async function deleteCategory(id: string) {
  try {
    const subCatsCount = await prisma.subCategory.count({
      where: { categoryId: id }
    });

    if (subCatsCount > 0) {
      return { error: `No se puede eliminar. Tenés ${subCatsCount} subcategorías vinculadas a este grupo.` };
    }

    await prisma.category.delete({
      where: { id },
    });
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Error al borrar categoría:", error);
    return { error: "No se puede eliminar la categoría porque tiene dependencias activas." };
  }
}

export async function createSubCategory(data: CreateSubCategoryInput) {
  try {
    if (!data.name || !data.categoryId) {
      return { error: "El nombre y la categoría madre son obligatorios." };
    }

    const newSubCategory = await prisma.subCategory.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        sizeTypeId: data.sizeTypeId || null,
      },
    });

    revalidatePath("/categories"); 
    return { success: true, data: newSubCategory };
  } catch (error: any) {
    console.error("Error en createSubCategoryAction:", error);
    if (error.code === "P2002") {
      return { error: "Ya existe una subcategoría con ese nombre en este grupo." };
    }
    return { error: "No se pudo crear la subcategoría." };
  }
}

export async function deleteSubCategory(id: string) {
  try {
    if (!id) return { error: "ID de subcategoría no provisto." };

    const garmentsCount = await prisma.garment.count({
      where: { subCategoryId: id },
    });

    if (garmentsCount > 0) {
      return { 
        error: `No se puede eliminar. Hay ${garmentsCount} producto(s) asignado(s) a esta subcategoría.` 
      };
    }

    await prisma.subCategory.delete({
      where: { id },
    });

    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Error en deleteSubCategoryAction:", error);
    return { error: "Ocurrió un error al intentar eliminar la subcategoría." };
  }
}

// ==========================================
// PROVEEDORES
// ==========================================

export async function getProviders() {
  try {
    const providers = await prisma.provider.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      include: {
        contacts: {
          where: { active: true }
        }
      }
    });
    return serializeData(providers);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return [];
  }
}