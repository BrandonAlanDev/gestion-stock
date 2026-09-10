"use server";
import { prisma } from "@/lib/prisma";
import { garmentSchema, type GarmentInput } from "@/lib/zod";
import { revalidateTag } from "next/cache";
import { serializeData } from "@/lib/utils";
import * as garmentService from "@/lib/services/garment-service";
import { getCachedProducts, getCachedProductById, getCachedCategories } from "@/lib/cache";
import { obtenerCarpetaPrenda } from "@/lib/services/imagenes-cloudinary/obtener-carpeta-prenda";
import { subirImagen } from "@/lib/services/imagenes-cloudinary/subir-imagen";
import { eliminarImagenes } from "@/lib/services/imagenes-cloudinary/eliminar-imagenes";
import { moverImagen } from "@/lib/services/imagenes-cloudinary/mover-imagen";
import { obtenerPublicIdDesdeUrl } from "@/lib/services/imagenes-cloudinary/obtener-public-id-desde-url";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";
import type { ProductoDetalleSerializado } from "@/types/productos/detalle-producto";
import type { DatosGuardarProducto } from "@/types/productos/opciones-producto";

export async function createGarment(data: GarmentInput) {
  const { tenantId } = await requiereAdmin();

  const parsed = garmentSchema.safeParse(data);
  if (!parsed.success) {
    const primerIssue = parsed.error.issues[0];
    return { error: primerIssue?.message ?? "Revisá los datos ingresados." };
  }

  const { name, price, maxPrice, cost, description, categoryId, subCategoryId, supplierId, variants, images, controlaStock, activo, etiquetas, opciones } = parsed.data;

  const datos: DatosGuardarProducto = {
    name,
    price,
    maxPrice: maxPrice || null,
    cost: cost ?? 0,
    description: description || null,
    categoryId,
    subCategoryId: subCategoryId || null,
    supplierId: supplierId || null,
    controlaStock,
    activo,
    etiquetas,
    opciones: opciones.map((opcion) => ({ name: opcion.name, values: opcion.values })),
    variants: variants.map((v) => ({
      id: v.id,
      opcionValores: v.opcionValores ?? [],
      stock: Number(v.stock),
      sku: v.sku || null,
      priceOverride: v.priceOverride ?? null,
    })),
    images: [],
  };

  let garmentId: string | null = null;
  const publicIdsSubidos: string[] = [];

  try {
    const garment = await garmentService.createGarment(tenantId, datos);
    garmentId = garment.id;

    const carpeta = obtenerCarpetaPrenda(tenantId, categoryId, garment.id);
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
          tenantId,
          srcImage: imagen.url,
          publicId: imagen.publicId,
          order: indice,
        })),
      });
    }

    revalidateTag(`tenant:${tenantId}:products`);
    return { success: true, data: serializeData(garment) };
  } catch (error: unknown) {
    console.error("❌ Error en createGarment:", error);
    if ((error as { code?: string })?.code === "P2002") {
      return { error: "El código ingresado ya pertenece a otra variante." };
    }
    await eliminarImagenes(publicIdsSubidos, tenantId);
    if (garmentId) {
      try {
        await garmentService.deleteGarment(tenantId, garmentId);
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
    const { id: tenantId } = await requiereTenantActivo();
    const resultado = await getCachedProducts(tenantId, page, limit, categoryId, search, subCategoryId);
    const { garments, total } = resultado;
    return {
      success: true,
      data: serializeData(garments),
      total,
      page: resultado.page,
      totalPages: Math.ceil(total / resultado.limit),
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
  const { id: tenantId } = await requiereTenantActivo();
  let categoryId: string | undefined;
  let subCategoryId: string | undefined;
  if (categoria || subcategoria) {
    const cats = await getCachedCategories(tenantId);
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
  const { id: tenantId } = await requiereTenantActivo();
  const cachedFn = getCachedProductById(tenantId, id);
  const garment = await cachedFn();
  return serializeData(garment) as unknown as ProductoDetalleSerializado | null;
}

export async function updateGarment(id: string, data: GarmentInput) {
  const { tenantId } = await requiereAdmin();

  const parsed = garmentSchema.safeParse(data);
  if (!parsed.success) {
    const primerIssue = parsed.error.issues[0];
    return { error: primerIssue?.message ?? "Revisá los datos ingresados." };
  }

  const { name, price, maxPrice, cost, description, categoryId, subCategoryId, supplierId, variants, images, controlaStock, activo, etiquetas, opciones } = parsed.data;

  const existing = await prisma.garment.findFirst({
    where: { id, tenantId },
    include: { images: { where: { tenantId } } },
  });
  if (!existing) return { error: "El producto no existe." };

  const costoServicio = typeof cost === "number" && !Number.isNaN(cost) ? cost : Number(existing.cost);

  const datos: DatosGuardarProducto = {
    name,
    price,
    maxPrice: maxPrice || null,
    cost: costoServicio,
    description: description || "",
    categoryId,
    subCategoryId: subCategoryId || null,
    supplierId: supplierId ?? existing.supplierId,
    controlaStock,
    activo,
    etiquetas,
    opciones: opciones.map((opcion) => ({ name: opcion.name, values: opcion.values })),
    variants: variants.map((v) => ({
      id: v.id,
      opcionValores: v.opcionValores ?? [],
      stock: Number(v.stock),
      sku: v.sku || null,
      priceOverride: v.priceOverride ?? null,
    })),
    images: [],
  };

  const cambioCategoria = categoryId !== existing.categoryId;
  const carpetaNueva = obtenerCarpetaPrenda(tenantId, categoryId, id);
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
            const movida = await moverImagen(publicIdExistente, carpetaNueva, tenantId);
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

    const updatedGarment = await garmentService.updateGarmentWithDetails(tenantId, id, {
      ...datos,
      images: finalImages,
    });

    const imagenesARemover = existing.images.filter((imagenExistente) => !urlsFinales.has(imagenExistente.srcImage));
    const resultados = await eliminarImagenes(
      imagenesARemover.map((imagenExistente) => imagenExistente.publicId ?? obtenerPublicIdDesdeUrl(imagenExistente.srcImage)),
      tenantId
    );

    revalidateTag(`tenant:${tenantId}:products`);
    revalidateTag(`tenant:${tenantId}:product:${id}`);

    if (resultados.some((resultado) => resultado === false)) {
      return { success: true, warning: "La información se actualizó, pero una imagen no pudo eliminarse correctamente." };
    }

    return { success: true, data: serializeData(updatedGarment) };
  } catch (error: unknown) {
    console.error("Error:", error);
    for (const par of paresMovidos) {
      try {
        await moverImagen(par.nuevo, obtenerCarpetaPrenda(tenantId, existing.categoryId, id), tenantId);
      } catch {
        console.error("No se pudo revertir el movimiento de la imagen.");
      }
    }
    await eliminarImagenes(publicIdsSubidos, tenantId);
    if ((error as { code?: string })?.code === "P2002") {
      return { error: "El SKU ya existe." };
    }
    return { error: "Error al actualizar el producto." };
  }
}

export async function deleteGarment(id: string) {
  const { tenantId } = await requiereAdmin();

  try {
    const existingGarment = await prisma.garment.findFirst({
      where: { id, tenantId },
      include: { images: { where: { tenantId } } },
    });
    if (!existingGarment) return { error: "El producto no existe o ya fue eliminado." };

    await garmentService.deleteGarment(tenantId, id);

    const publicIds = existingGarment.images.map(
      (imagen) => imagen.publicId ?? obtenerPublicIdDesdeUrl(imagen.srcImage)
    );
    await eliminarImagenes(publicIds, tenantId);

    revalidateTag(`tenant:${tenantId}:products`);
    revalidateTag(`tenant:${tenantId}:product:${id}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("DELETE_GARMENT_ERROR:", error);
    if ((error as { code?: string })?.code === "P2003") {
      return { error: "No se puede eliminar: existen registros vinculados." };
    }
    return { error: "Ocurrió un error inesperado al intentar eliminar el producto." };
  }
}
