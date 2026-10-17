"use server";

import { obtenerPublicIdDesdeUrl } from "@/lib/services/imagenes-cloudinary/obtener-public-id-desde-url";
import { obtenerCarpetaPrenda } from "@/lib/services/imagenes-cloudinary/obtener-carpeta-prenda";
import { eliminarImagenes } from "@/lib/services/imagenes-cloudinary/eliminar-imagenes";
import { moverImagen } from "@/lib/services/imagenes-cloudinary/mover-imagen";
import { publicIdPerteneceTenant } from "@/lib/services/imagenes-cloudinary/public-id-pertenece-tenant";
import { subirImagen } from "@/lib/services/imagenes-cloudinary/subir-imagen";
import { actualizarRegistroPrendaConDetalles } from "@/lib/services/prendas/actualizar-registro-prenda";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";
import { serializarDatos as serializeData } from "@/lib/utilidades/serializar-datos";
import { garmentSchema as esquemaPrenda } from "@/lib/validaciones/esquemas";
import { revalidateTag } from "next/cache";
import type { z } from "zod";

export async function actualizarPrenda(id: string, datos: z.input<typeof esquemaPrenda>) {
  const { tenantId } = await requiereAdmin();
  const resultadoValidacion = esquemaPrenda.safeParse(datos);
  if (!resultadoValidacion.success) return { error: resultadoValidacion.error.format() };

  const { name, price, maxPrice, cost, description, categoryId, subCategoryId, supplierId, variants, images, opciones, etiquetas, controlaStock, activo } = resultadoValidacion.data;
  const prendaExistente = await conPrisma((prisma) => prisma.garment.findFirst({
    where: { id },
    include: {
      images: { where: {}, orderBy: { order: "asc" } },
      variants: {
        where: {},
        include: { optionValues: { include: { optionValue: { include: { option: true } } } } },
      },
      opciones: { where: {}, include: { values: true }, orderBy: { position: "asc" } },
    },
  }));
  if (!prendaExistente) return { error: "El producto no existe." };

  const opcionesFinales = datos.opciones === undefined
    ? prendaExistente.opciones.map((opcion) => ({
        name: opcion.name,
        values: [...opcion.values].sort((a, b) => a.position - b.position).map((valor) => valor.value),
      }))
    : opciones;
  const etiquetasExistentes = Array.isArray(prendaExistente.etiquetas)
    ? prendaExistente.etiquetas.filter((etiqueta): etiqueta is string => typeof etiqueta === "string")
    : [];
  const variantesFinales = variants.map((variante, indice) => {
    const anterior = prendaExistente.variants.find((actual) => actual.id === variante.id);
    const original = datos.variants[indice];
    return {
      id: variante.id,
      stock: variante.stock,
      sku: variante.sku ?? null,
      sizeId: original.sizeId === undefined ? anterior?.sizeId ?? null : variante.sizeId ?? null,
      colorId: original.colorId === undefined ? anterior?.colorId ?? null : variante.colorId ?? null,
      attributes: original.attributes === undefined ? anterior?.attributes ?? null : variante.attributes ?? null,
      priceOverride: original.priceOverride === undefined
        ? anterior?.priceOverride == null ? null : Number(anterior.priceOverride)
        : variante.priceOverride ?? null,
      opcionValores: datos.opciones === undefined
        ? anterior?.optionValues.map((vinculo) => ({
            opcion: vinculo.optionValue.option.name,
            valor: vinculo.optionValue.value,
          })) ?? []
        : variante.opcionValores,
    };
  });

  const cambioCategoria = categoryId !== prendaExistente.categoryId;
  const carpetaNueva = obtenerCarpetaPrenda(tenantId, categoryId, id);
  const paresMovidos: Array<{ viejo: string; nuevo: string }> = [];
  const idsPublicosSubidos: string[] = [];
  const imagenesFinales: Array<{ url: string; publicId?: string | null; order: number }> = [];
  const urlsFinales = new Set<string>();
  let contadorImagenes = 0;
  const sufijoUnico = Date.now();

  try {
    for (const imagen of images ?? prendaExistente.images.map((actual) => actual.srcImage)) {
      if (imagen.startsWith("data:image")) {
        contadorImagenes += 1;
        const subida = await subirImagen(imagen, carpetaNueva, tenantId, `imagen-${sufijoUnico}-${contadorImagenes}`);
        idsPublicosSubidos.push(subida.publicId);
        imagenesFinales.push({ url: subida.url, publicId: subida.publicId, order: imagenesFinales.length });
        urlsFinales.add(subida.url);
      } else {
        const imagenExistente = prendaExistente.images.find((imagenActual) => imagenActual.srcImage === imagen);
        if (imagenExistente) {
          const idPublicoExistente = imagenExistente.publicId ?? obtenerPublicIdDesdeUrl(imagenExistente.srcImage);
          if (cambioCategoria && idPublicoExistente && publicIdPerteneceTenant(idPublicoExistente, tenantId)) {
            const imagenMovida = await moverImagen(idPublicoExistente, carpetaNueva, tenantId);
            paresMovidos.push({ viejo: idPublicoExistente, nuevo: imagenMovida.publicId });
            imagenesFinales.push({ url: imagenMovida.url, publicId: imagenMovida.publicId, order: imagenesFinales.length });
            urlsFinales.add(imagenMovida.url);
          } else {
            imagenesFinales.push({ url: imagenExistente.srcImage, publicId: idPublicoExistente, order: imagenesFinales.length });
            urlsFinales.add(imagenExistente.srcImage);
          }
        } else {
          imagenesFinales.push({ url: imagen, publicId: obtenerPublicIdDesdeUrl(imagen), order: imagenesFinales.length });
          urlsFinales.add(imagen);
        }
      }
    }

    const prendaActualizada = await conPrisma((prisma) => actualizarRegistroPrendaConDetalles(prisma, tenantId, id, {
      name,
      price,
      maxPrice: maxPrice || null,
      cost: cost ?? Number(prendaExistente.cost),
      description: description || "",
      categoryId,
      subCategoryId: subCategoryId || null,
      supplierId: datos.supplierId === undefined ? prendaExistente.supplierId : supplierId || null,
      controlaStock: datos.controlaStock === undefined ? prendaExistente.controlaStock : controlaStock,
      activo: datos.activo === undefined ? prendaExistente.active : activo,
      etiquetas: datos.etiquetas === undefined ? etiquetasExistentes : etiquetas,
      opciones: opcionesFinales,
      variants: variantesFinales,
      images: imagenesFinales,
    }));

    const imagenesARemover = prendaExistente.images.filter((imagenActual) => !urlsFinales.has(imagenActual.srcImage));
    const resultados = await eliminarImagenes(
      imagenesARemover.map((imagenActual) => imagenActual.publicId ?? obtenerPublicIdDesdeUrl(imagenActual.srcImage)),
      tenantId
    );
    revalidateTag(`products`);
    revalidateTag(`product:${id}`);

    if (resultados.some((resultado) => resultado === false)) {
      return { success: true, warning: "La información se actualizó, pero una imagen no pudo eliminarse correctamente." };
    }
    return { success: true, data: serializeData(prendaActualizada) };
  } catch (error: unknown) {
    console.error("Error al actualizarPrenda:", error);
    for (const par of paresMovidos) {
      try {
        await moverImagen(par.nuevo, obtenerCarpetaPrenda(tenantId, prendaExistente.categoryId, id), tenantId);
      } catch {
        console.error("No se pudo revertir el movimiento de la imagen.");
      }
    }
    await eliminarImagenes(idsPublicosSubidos, tenantId);
    if ((error as { code?: string })?.code === "P2002") return { error: "El SKU ya existe." };
    return { error: "Error al actualizar el producto." };
  }
}
