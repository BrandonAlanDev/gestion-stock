"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { garmentSchema } from "@/lib/zod";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";
import { v2 as cloudinary } from "cloudinary";
import {
  getCachedProducts,
  getCachedCategories,
  getCachedProviders,
} from "@/lib/cache";
import * as garmentService from "@/lib/services/garment-service";
import * as categoryService from "@/lib/services/category-service";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ────────────────────────────────────────────────
// GARMENTS
// ────────────────────────────────────────────────
export async function createGarment(data: any) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const parsed = garmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.format() };

  const { name, price, cost, description, categoryId, subCategoryId, supplierId, variants, images } = parsed.data;

  try {
    let mappedImages: { srcImage: string; order: number }[] = [];
    if (images && images.length > 0) {
      mappedImages = images.map((url: string, index: number) => ({ srcImage: url, order: index }));
    }

    const garment = await garmentService.createGarment({
      data: {
        name,
        price,
        cost,
        description,
        categoryId,
        subCategoryId: subCategoryId || null,
        supplierId: supplierId || null,
        variants: { create: variants.map((v: any) => ({ sku: v.sku || null, stock: Number(v.stock), sizeId: v.sizeId || null, colorId: v.colorId || null, attributes: v.attributes || null })) },
        images: { create: mappedImages },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/productos");
    return { success: true, data: serializeData(garment) };
  } catch (error: any) {
    console.error("❌ Error en createGarment:", error);
    if (error.code === 'P2002') return { error: "El SKU ya pertenece a otra variante." };
    return { error: "Error interno al crear el producto." };
  }
}

export async function getGarments(
  page: number = 1,
  limit: number = 20,
  categoryId?: string,
  search?: string
) {
  try {
    const cachedFn = getCachedProducts(page, limit, categoryId, search);
    const { garments, total } = await cachedFn();
    return {
      success: true,
      data: serializeData(garments),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error: any) {
    console.error("Error en getGarments:", error);
    return { error: error.message || "Error al cargar productos" };
  }
}

export async function getGarmentById(id: string) {
  const garment = await garmentService.getGarmentById(id);
  return serializeData(garment);
}

export async function updateGarment(id: string, data: any) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

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
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    const updatedGarment = await prisma.$transaction(async (tx) => {
      const garment = await tx.garment.update({
        where: { id },
        data: {
          name,
          price,
          cost,
          description,
          categoryId,
          subCategoryId: subCategoryId || null,
          supplierId: supplierId || null,
        },
      });

      const currentVariants = await tx.garmentVariant.findMany({ where: { garmentId: id } });
      const currentVariantIds = currentVariants.map((v) => v.id);
      const incomingVariantIds = variants.filter((v: any) => v.id).map((v: any) => v.id);
      const idsToDelete = currentVariantIds.filter((vid) => !incomingVariantIds.includes(vid));
      if (idsToDelete.length > 0) {
        await tx.garmentVariant.deleteMany({ where: { id: { in: idsToDelete } } });
      }

      for (const v of variants) {
        if (v.id) {
          await tx.garmentVariant.update({
            where: { id: v.id },
            data: { sku: v.sku, stock: Number(v.stock), sizeId: v.sizeId || null, colorId: v.colorId || null, attributes: v.attributes || null },
          });
        } else {
          await tx.garmentVariant.create({
            data: { garmentId: id, sku: v.sku, stock: Number(v.stock), sizeId: v.sizeId || null, colorId: v.colorId || null, attributes: v.attributes || null },
          });
        }
      }

      await tx.garmentImage.deleteMany({ where: { garmentId: id } });
      if (finalImageRecords.length > 0) {
        await tx.garmentImage.createMany({
          data: finalImageRecords.map(r => ({ garmentId: id, srcImage: r.srcImage, order: r.order })),
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
    const existingGarment = await prisma.garment.findUnique({ where: { id }, include: { variants: true } });
    if (!existingGarment) return { error: "El producto no existe o ya fue eliminado." };

    await garmentService.deleteGarment(id);
    revalidatePath("/dashboard/productos");
    return { success: true };
  } catch (error: any) {
    console.error("DELETE_GARMENT_ERROR:", error);
    if (error.code === 'P2003') return { error: "No se puede eliminar: existen registros vinculados." };
    return { error: "Ocurrió un error inesperado al intentar eliminar el producto." };
  }
}

// ── CATEGORÍAS (acción delegada al servicio + caché) ──
export const getCategories = getCachedCategories; // reutiliza la caché

export async function createCategory(formData: { name: string; description?: string }) {
  try {
    const newCategory = await categoryService.createCategory(formData.name);
    revalidatePath("/categories");
    return { success: true, data: newCategory };
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return { error: "Error al crear categoría" };
  }
}

export async function updateCategory(id: string, data: { name: string; description?: string }) {
  try {
    const updated = await categoryService.updateCategory(id, data);
    revalidatePath("/categories");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return { error: "Error al actualizar los datos." };
  }
}

export async function deleteCategory(id: string) {
  try {
    const subCatsCount = await categoryService.getSubCategoriesCount(id);
    if (subCatsCount > 0) {
      return { error: `No se puede eliminar. Tenés ${subCatsCount} subcategorías vinculadas.` };
    }
    await categoryService.deleteCategory(id);
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Error al borrar categoría:", error);
    return { error: "No se puede eliminar la categoría porque tiene dependencias activas." };
  }
}

export async function createSubCategory(data: { name: string; categoryId: string; sizeTypeId: string | null }) {
  try {
    if (!data.name || !data.categoryId) return { error: "El nombre y la categoría madre son obligatorios." };
    const newSub = await categoryService.createSubCategory(data);
    revalidatePath("/categories");
    return { success: true, data: newSub };
  } catch (error: any) {
    console.error("Error en createSubCategoryAction:", error);
    if (error.code === "P2002") return { error: "Ya existe una subcategoría con ese nombre en este grupo." };
    return { error: "No se pudo crear la subcategoría." };
  }
}

export async function deleteSubCategory(id: string) {
  try {
    if (!id) return { error: "ID de subcategoría no provisto." };
    const garmentsCount = await categoryService.getGarmentCountBySubCategory(id);
    if (garmentsCount > 0) return { error: `No se puede eliminar. Hay ${garmentsCount} producto(s) asignado(s).` };
    await categoryService.deleteSubCategory(id);
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Error en deleteSubCategoryAction:", error);
    return { error: "Ocurrió un error al intentar eliminar la subcategoría." };
  }
}

// ── PROVEEDORES (ahora desde el servicio cacheado) ──
export const getProviders = getCachedProviders; // reutiliza la caché

// ── UTILS ──
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