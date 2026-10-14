"use server";

import { Prisma } from "@/../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { obtenerPublicIdDesdeUrl } from "@/lib/services/imagenes-cloudinary/obtener-public-id-desde-url";
import { obtenerCarpetaPrenda } from "@/lib/services/imagenes-cloudinary/obtener-carpeta-prenda";
import { eliminarImagenes } from "@/lib/services/imagenes-cloudinary/eliminar-imagenes";
import { moverImagen } from "@/lib/services/imagenes-cloudinary/mover-imagen";
import { subirImagen } from "@/lib/services/imagenes-cloudinary/subir-imagen";
import { updateGarmentWithDetails as actualizarRegistroPrendaConDetalles } from "@/lib/services/garment-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { serializarDatos as serializeData } from "@/lib/utilidades/serializar-datos";
import { garmentSchema as esquemaPrenda, type GarmentInput as EntradaPrenda } from "@/lib/validaciones/esquemas";
import { revalidateTag } from "next/cache";

export async function actualizarPrenda(id: string, datos: EntradaPrenda) {
  const { tenantId } = await requiereAdmin();
  const resultadoValidacion = esquemaPrenda.safeParse(datos);
  if (!resultadoValidacion.success) return { error: resultadoValidacion.error.format() };

  const { name, price, maxPrice, cost, description, categoryId, subCategoryId, supplierId, variants, images } = resultadoValidacion.data;
  const prendaExistente = await prisma.garment.findFirst({
    where: { id, tenantId },
    include: { images: { where: { tenantId } } },
  });
  if (!prendaExistente) return { error: "El producto no existe." };

  const cambioCategoria = categoryId !== prendaExistente.categoryId;
  const carpetaNueva = obtenerCarpetaPrenda(tenantId, categoryId, id);
  const paresMovidos: Array<{ viejo: string; nuevo: string }> = [];
  const idsPublicosSubidos: string[] = [];
  const imagenesFinales: Array<{ url: string; publicId?: string | null; order: number }> = [];
  const urlsFinales = new Set<string>();
  let contadorImagenes = 0;
  const sufijoUnico = Date.now();

  try {
    for (const imagen of images ?? []) {
      if (imagen.startsWith("data:image")) {
        contadorImagenes += 1;
        const subida = await subirImagen(imagen, carpetaNueva, `imagen-${sufijoUnico}-${contadorImagenes}`);
        idsPublicosSubidos.push(subida.publicId);
        imagenesFinales.push({ url: subida.url, publicId: subida.publicId, order: imagenesFinales.length });
        urlsFinales.add(subida.url);
      } else {
        const imagenExistente = prendaExistente.images.find((imagenActual) => imagenActual.srcImage === imagen);
        if (imagenExistente) {
          const idPublicoExistente = imagenExistente.publicId ?? obtenerPublicIdDesdeUrl(imagenExistente.srcImage);
          if (cambioCategoria && idPublicoExistente) {
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

    const prendaActualizada = await actualizarRegistroPrendaConDetalles(tenantId, id, {
      name,
      price,
      maxPrice: maxPrice || null,
      cost,
      description: description || "",
      categoryId,
      subCategoryId: subCategoryId || null,
      supplierId: supplierId || null,
      variants: variants.map((variante) => ({
        ...variante,
        attributes: variante.attributes === null ? Prisma.JsonNull : variante.attributes ?? undefined,
      })),
      images: imagenesFinales,
    });

    const imagenesARemover = prendaExistente.images.filter((imagenActual) => !urlsFinales.has(imagenActual.srcImage));
    const resultados = await eliminarImagenes(
      imagenesARemover.map((imagenActual) => imagenActual.publicId ?? obtenerPublicIdDesdeUrl(imagenActual.srcImage)),
      tenantId
    );
    revalidateTag(`tenant:${tenantId}:products`);
    revalidateTag(`tenant:${tenantId}:product:${id}`);

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
