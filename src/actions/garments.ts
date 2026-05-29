// src/actions/garments.ts
"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { garmentSchema } from "@/lib/zod";
import { revalidateTag } from "next/cache";
import { serializeData, extractPublicId } from "@/lib/utils";
import { v2 as cloudinary } from "cloudinary";
import { getCachedProducts } from "@/lib/cache";
import * as garmentService from "@/lib/services/garment-service";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    revalidateTag("products");
    return { success: true, data: serializeData(garment) };
  } catch (error: any) {
    console.error("❌ Error en createGarment:", error);
    if (error.code === 'P2002') return { error: "El SKU ya pertenece a otra variante." };
    return { error: "Error interno al crear el producto." };
  }
}

export async function getGarments(page: number = 1, limit: number = 20, categoryId?: string, search?: string) {
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

  const parsed = garmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.format() };

  const { name, price, cost, description, categoryId, subCategoryId, supplierId, variants, images } = parsed.data;

  try {
    const existingImages = await prisma.garmentImage.findMany({ where: { garmentId: id } });
    let finalImages: string[] = [];

    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.startsWith("data:image")) {
          const uploadResponse = await cloudinary.uploader.upload(img, {
            folder: "gestion-stock/garments",
          });
          finalImages.push(uploadResponse.secure_url);
        } else {
          finalImages.push(img);
        }
      }
    }

    const newUrlsSet = new Set(finalImages);
    const imagesToDelete = existingImages.filter(img => !newUrlsSet.has(img.srcImage));
    for (const img of imagesToDelete) {
      const publicId = extractPublicId(img.srcImage);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    const updatedGarment = await garmentService.updateGarmentWithDetails(id, {
      name,
      price,
      cost,
      description: description || "",
      categoryId,
      subCategoryId,
      supplierId,
      variants,
      images: finalImages,
    });

    revalidateTag("products");
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
    revalidateTag("products");
    return { success: true };
  } catch (error: any) {
    console.error("DELETE_GARMENT_ERROR:", error);
    if (error.code === 'P2003') return { error: "No se puede eliminar: existen registros vinculados." };
    return { error: "Ocurrió un error inesperado al intentar eliminar el producto." };
  }
}