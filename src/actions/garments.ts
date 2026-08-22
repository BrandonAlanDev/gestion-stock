"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { garmentSchema, type GarmentInput } from "@/lib/zod";
import { revalidateTag } from "next/cache";
import { serializeData } from "@/lib/utils";
import * as garmentService from "@/lib/services/garment-service";
import { getCachedProducts, getCachedProductById, getCachedCategories } from "@/lib/cache";
import {
  obtenerCarpetaPrenda,
  subirImagen,
  eliminarImagenes,
  moverImagen,
  obtenerPublicIdDesdeUrl,
} from "@/lib/services/cloudinary-service";

export async function createGarment(data: GarmentInput) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const parsed = garmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.format() };

  const { name, price, maxPrice, cost, description, categoryId, subCategoryId, supplierId, variants, images } = parsed.data;

  let garmentId: string | null = null;
  const publicIdsSubidos: string[] = [];

  try {
    const garment = await garmentService.createGarment({
      name,
      price,
      maxPrice: maxPrice || null,
      cost,
      description,
      categoryId,
      subCategoryId: subCategoryId || null,
      supplierId: supplierId || null,
      variants: { create: variants.map((v) => ({ sku: v.sku || null, stock: Number(v.stock), sizeId: v.sizeId || null, colorId: v.colorId || null, attributes: v.attributes || null })) },
    });
    garmentId = garment.id;

    const carpeta = obtenerCarpetaPrenda(categoryId, garment.id);
    const imagenesFinales: Array<{ url: string; publicId: string | null }> = [];
    let contadorImagenes = 0;

    for (const img of images ?? []) {
      if (img.startsWith("data:image")) {
        contadorImagenes += 1;
        const subida = await subirImagen(img, carpeta, `imagen-${contadorImagenes}`);
        publicIdsSubidos.push(subida.publicId);
        imagenesFinales.push({ url: subida.url, publicId: subida.publicId });
      } else {
        imagenesFinales.push({ url: img, publicId: obtenerPublicIdDesdeUrl(img) });
      }
    }

    if (imagenesFinales.length > 0) {
      await prisma.garmentImage.createMany({
        data: imagenesFinales.map((imagen, indice) => ({
          garmentId: garment.id,
          srcImage: imagen.url,
          publicId: imagen.publicId,
          order: indice,
        })),
      });
    }

    revalidateTag("products");
    return { success: true, data: serializeData(garment) };
  } catch (error: unknown) {
    console.error("❌ Error en createGarment:", error);
    if ((error as { code?: string })?.code === "P2002") {
      return { error: "El SKU ingresado ya pertenece a otra variante." };
    }
    await eliminarImagenes(publicIdsSubidos);
    if (garmentId) {
      try {
        await garmentService.deleteGarment(garmentId);
      } catch {
        console.error("No se pudo eliminar el producto tras un error de imágenes.");
      }
    }
    return { error: "No se pudieron cargar las imágenes del producto. Intentá nuevamente." };
  }
}

export async function getGarments(
  page: number = 1,
  limit: number = 20,
  categoryId?: string,
  search?: string,
  subCategoryId?: string
) {
  try {
    const { garments, total } = await getCachedProducts(page, limit, categoryId, search, subCategoryId);
    return {
      success: true,
      data: serializeData(garments),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error: unknown) {
    console.error("Error en getGarments:", error);
    return { error: "Error al cargar productos" };
  }
}

export async function getGarmentsByNames(
  page: number,
  limit: number,
  categoria?: string,
  search?: string,
  subcategoria?: string
) {
  let categoryId: string | undefined;
  let subCategoryId: string | undefined;
  if (categoria || subcategoria) {
    const cats = await getCachedCategories();
    if (categoria) {
      const decoded = decodeURIComponent(categoria).trim().toLowerCase();
      categoryId = cats.find(
        (c) => c.id === decoded || c.name.trim().toLowerCase() === decoded
      )?.id;
    }
    if (subcategoria && categoryId) {
      const decoded = decodeURIComponent(subcategoria).trim().toLowerCase();
      subCategoryId = cats
        .find((c) => c.id === categoryId)
        ?.subCategories.find(
          (s) => s.id === decoded || s.name.trim().toLowerCase() === decoded
        )?.id;
    }
  }
  return getGarments(page, limit, categoryId, search, subCategoryId);
}

export async function getGarmentById(id: string) {
  const cachedFn = getCachedProductById(id);
  const garment = await cachedFn();
  return serializeData(garment);
}

export async function updateGarment(id: string, data: GarmentInput) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  const parsed = garmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.format() };

  const { name, price, maxPrice, cost, description, categoryId, subCategoryId, supplierId, variants, images } = parsed.data;

  const existing = await prisma.garment.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!existing) return { error: "El producto no existe." };

  const cambioCategoria = categoryId !== existing.categoryId;
  const carpetaNueva = obtenerCarpetaPrenda(categoryId, id);
  const paresMovidos: Array<{ viejo: string; nuevo: string }> = [];
  const publicIdsSubidos: string[] = [];
  const finalImages: Array<{ url: string; publicId?: string | null; order: number }> = [];
  const urlsFinales = new Set<string>();
  let contadorImagenes = 0;
  const sufijoUnico = Date.now();

  try {
    for (const img of images ?? []) {
      if (img.startsWith("data:image")) {
        contadorImagenes += 1;
        const subida = await subirImagen(img, carpetaNueva, `imagen-${sufijoUnico}-${contadorImagenes}`);
        publicIdsSubidos.push(subida.publicId);
        finalImages.push({ url: subida.url, publicId: subida.publicId, order: finalImages.length });
        urlsFinales.add(subida.url);
      } else {
        const existente = existing.images.find((imagenExistente) => imagenExistente.srcImage === img);
        if (existente) {
          const publicIdExistente = existente.publicId ?? obtenerPublicIdDesdeUrl(existente.srcImage);
          if (cambioCategoria && publicIdExistente) {
            const movida = await moverImagen(publicIdExistente, carpetaNueva);
            paresMovidos.push({ viejo: publicIdExistente, nuevo: movida.publicId });
            finalImages.push({ url: movida.url, publicId: movida.publicId, order: finalImages.length });
            urlsFinales.add(movida.url);
          } else {
            finalImages.push({ url: existente.srcImage, publicId: publicIdExistente, order: finalImages.length });
            urlsFinales.add(existente.srcImage);
          }
        } else {
          finalImages.push({ url: img, publicId: obtenerPublicIdDesdeUrl(img), order: finalImages.length });
          urlsFinales.add(img);
        }
      }
    }

    const updatedGarment = await garmentService.updateGarmentWithDetails(id, {
      name,
      price,
      maxPrice: maxPrice || null,
      cost,
      description: description || "",
      categoryId,
      subCategoryId: subCategoryId || null,
      supplierId: supplierId || null,
      variants,
      images: finalImages,
    });

    const imagenesARemover = existing.images.filter((imagenExistente) => !urlsFinales.has(imagenExistente.srcImage));
    const resultados = await eliminarImagenes(
      imagenesARemover.map((imagenExistente) => imagenExistente.publicId ?? obtenerPublicIdDesdeUrl(imagenExistente.srcImage))
    );

    revalidateTag("products");
    revalidateTag(`product-${id}`);

    if (resultados.some((resultado) => resultado === false)) {
      return { success: true, warning: "La información se actualizó, pero una imagen no pudo eliminarse correctamente." };
    }

    return { success: true, data: serializeData(updatedGarment) };
  } catch (error: unknown) {
    console.error("Error:", error);
    for (const par of paresMovidos) {
      try {
        await moverImagen(par.nuevo, obtenerCarpetaPrenda(existing.categoryId, id));
      } catch {
        console.error("No se pudo revertir el movimiento de la imagen.");
      }
    }
    await eliminarImagenes(publicIdsSubidos);
    if ((error as { code?: string })?.code === "P2002") {
      return { error: "El SKU ya existe." };
    }
    return { error: "Error al actualizar el producto." };
  }
}

export async function deleteGarment(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");

  try {
    const existingGarment = await prisma.garment.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existingGarment) return { error: "El producto no existe o ya fue eliminado." };

    await garmentService.deleteGarment(id);

    const publicIds = existingGarment.images.map(
      (imagen) => imagen.publicId ?? obtenerPublicIdDesdeUrl(imagen.srcImage)
    );
    await eliminarImagenes(publicIds);

    revalidateTag("products");
    revalidateTag(`product-${id}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("DELETE_GARMENT_ERROR:", error);
    if ((error as { code?: string })?.code === "P2003") {
      return { error: "No se puede eliminar: existen registros vinculados." };
    }
    return { error: "Ocurrió un error inesperado al intentar eliminar el producto." };
  }
}
