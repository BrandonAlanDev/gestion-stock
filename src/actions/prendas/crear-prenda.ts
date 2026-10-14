"use server";

import { Prisma } from "@/../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { obtenerPublicIdDesdeUrl } from "@/lib/services/imagenes-cloudinary/obtener-public-id-desde-url";
import { obtenerCarpetaPrenda } from "@/lib/services/imagenes-cloudinary/obtener-carpeta-prenda";
import { eliminarImagenes } from "@/lib/services/imagenes-cloudinary/eliminar-imagenes";
import { subirImagen } from "@/lib/services/imagenes-cloudinary/subir-imagen";
import { createGarment as crearRegistroPrenda, deleteGarment as eliminarRegistroPrenda } from "@/lib/services/garment-service";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { serializarDatos as serializeData } from "@/lib/utilidades/serializar-datos";
import { garmentSchema as esquemaPrenda, type GarmentInput as EntradaPrenda } from "@/lib/validaciones/esquemas";
import { revalidateTag } from "next/cache";

export async function crearPrenda(datos: EntradaPrenda) {
  const { tenantId } = await requiereAdmin();
  const resultadoValidacion = esquemaPrenda.safeParse(datos);
  if (!resultadoValidacion.success) return { error: resultadoValidacion.error.format() };

  const { name, price, maxPrice, cost, description, categoryId, subCategoryId, supplierId, variants, images } = resultadoValidacion.data;
  let idPrenda: string | null = null;
  const idsPublicosSubidos: string[] = [];

  try {
    const prenda = await crearRegistroPrenda(tenantId, {
      name,
      price,
      maxPrice: maxPrice || null,
      cost,
      description,
      categoryId,
      subCategoryId: subCategoryId || null,
      supplierId: supplierId || null,
      variants: {
        create: variants.map((variante) => ({
          tenantId,
          sku: variante.sku || null,
          stock: Number(variante.stock),
          sizeId: variante.sizeId || null,
          colorId: variante.colorId || null,
          attributes: variante.attributes === null ? Prisma.JsonNull : variante.attributes ?? undefined,
        })),
      },
    });
    idPrenda = prenda.id;

    const carpeta = obtenerCarpetaPrenda(tenantId, categoryId, prenda.id);
    const imagenesFinales: Array<{ url: string; publicId: string | null }> = [];
    let contadorImagenes = 0;
    for (const imagen of images ?? []) {
      if (imagen.startsWith("data:image")) {
        contadorImagenes += 1;
        const subida = await subirImagen(imagen, carpeta, `imagen-${contadorImagenes}`);
        idsPublicosSubidos.push(subida.publicId);
        imagenesFinales.push({ url: subida.url, publicId: subida.publicId });
      } else {
        imagenesFinales.push({ url: imagen, publicId: obtenerPublicIdDesdeUrl(imagen) });
      }
    }

    if (imagenesFinales.length > 0) {
      await prisma.garmentImage.createMany({
        data: imagenesFinales.map((imagen, indice) => ({
          garmentId: prenda.id,
          tenantId,
          srcImage: imagen.url,
          publicId: imagen.publicId,
          order: indice,
        })),
      });
    }

    revalidateTag(`tenant:${tenantId}:products`);
    return { success: true, data: serializeData(prenda) };
  } catch (error: unknown) {
    console.error("Error en crearPrenda:", error);
    if ((error as { code?: string })?.code === "P2002") return { error: "El SKU ingresado ya pertenece a otra variante." };
    await eliminarImagenes(idsPublicosSubidos, tenantId);
    if (idPrenda) {
      try {
        await eliminarRegistroPrenda(tenantId, idPrenda);
      } catch {
        console.error("No se pudo eliminar el producto tras un error de imágenes.");
      }
    }
    return { error: "No se pudieron cargar las imágenes del producto. Intentá nuevamente." };
  }
}
