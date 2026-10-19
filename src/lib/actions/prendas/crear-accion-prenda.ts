import type { PrismaClient } from "@/../generated/prisma/client";
import type { garmentSchema } from "@/lib/validaciones/esquemas";
import type { DatosGuardarProducto } from "@/types/productos/opciones-producto";
import type { ContextoTenantSesion } from "@/types/tenants";
import type { z } from "zod";

type DatosValidadosPrenda = z.output<typeof garmentSchema>;

interface ResultadoValidacionPrenda {
  success: true;
  data: DatosValidadosPrenda;
}

interface ErrorValidacionPrenda {
  success: false;
  error: { format: () => unknown };
}

export interface DependenciasCrearAccionPrenda {
  requiereAdmin: () => Promise<Pick<ContextoTenantSesion, "tenantId">>;
  validar: (datos: unknown) => ResultadoValidacionPrenda | ErrorValidacionPrenda;
  conPrisma: <T>(
    operacion: (prisma: PrismaClient) => Promise<T>,
  ) => Promise<T>;
  crearRegistroPrenda: (
    prisma: PrismaClient,
    tenantId: string,
    datos: DatosGuardarProducto,
  ) => Promise<{ id: string }>;
  eliminarRegistroPrenda: (
    prisma: PrismaClient,
    tenantId: string,
    id: string,
  ) => Promise<unknown>;
  obtenerCarpetaPrenda: (tenantId: string, categoryId: string, garmentId: string) => string;
  obtenerPublicIdDesdeUrl: (url: string) => string | null;
  eliminarImagenes: (
    publicIds: Array<string | null | undefined>,
    tenantId: string,
  ) => Promise<unknown>;
  subirImagen: (
    origen: string,
    carpeta: string,
    tenantId: string,
    prefijoNombre?: string,
  ) => Promise<{ url: string; publicId: string }>;
  serializarDatos: <T>(datos: T) => T;
  revalidateTag: (tag: string) => void;
  registrarError: (mensaje: string, error: unknown) => void;
}

/** Crea el flujo de la acción con su autoridad y almacenamiento explícitos. */
export function crearAccionPrenda(dependencias: DependenciasCrearAccionPrenda) {
  return async function ejecutar(datos: unknown) {
    const { tenantId } = await dependencias.requiereAdmin();
    const resultadoValidacion = dependencias.validar(datos);
    if (!resultadoValidacion.success) {
      return { error: resultadoValidacion.error.format() };
    }

    const {
      name,
      price,
      maxPrice,
      cost,
      description,
      categoryId,
      subCategoryId,
      supplierId,
      variants,
      images,
      opciones,
      etiquetas,
      controlaStock,
      activo,
    } = resultadoValidacion.data;
    let idPrenda: string | null = null;
    const idsPublicosSubidos: string[] = [];

    try {
      const prenda = await dependencias.conPrisma((prisma) =>
        dependencias.crearRegistroPrenda(prisma, tenantId, {
          name,
          price,
          maxPrice: maxPrice || null,
          cost: cost ?? 0,
          description: description ?? null,
          categoryId,
          subCategoryId: subCategoryId || null,
          supplierId: supplierId || null,
          controlaStock,
          activo,
          etiquetas,
          opciones,
          variants: variants.map((variante) => ({
            sku: variante.sku || null,
            stock: Number(variante.stock),
            sizeId: variante.sizeId || null,
            colorId: variante.colorId || null,
            attributes: variante.attributes ?? null,
            priceOverride: variante.priceOverride ?? null,
            opcionValores: variante.opcionValores,
          })),
          images: [],
        }),
      );
      idPrenda = prenda.id;

      const carpeta = dependencias.obtenerCarpetaPrenda(tenantId, categoryId, prenda.id);
      const imagenesFinales: Array<{ url: string; publicId: string | null }> = [];
      let contadorImagenes = 0;
      for (const imagen of images ?? []) {
        if (imagen.startsWith("data:image")) {
          contadorImagenes += 1;
          const subida = await dependencias.subirImagen(
            imagen,
            carpeta,
            tenantId,
            `imagen-${contadorImagenes}`,
          );
          idsPublicosSubidos.push(subida.publicId);
          imagenesFinales.push({ url: subida.url, publicId: subida.publicId });
        } else {
          imagenesFinales.push({ url: imagen, publicId: dependencias.obtenerPublicIdDesdeUrl(imagen) });
        }
      }

      if (imagenesFinales.length > 0) {
        await dependencias.conPrisma((prisma) => prisma.garmentImage.createMany({
          data: imagenesFinales.map((imagen, indice) => ({
            garmentId: prenda.id,
            srcImage: imagen.url,
            publicId: imagen.publicId,
            order: indice,
          })),
        }));
      }

      dependencias.revalidateTag(`tenant:${tenantId}:products`);
      return { success: true, data: dependencias.serializarDatos(prenda) };
    } catch (error: unknown) {
      dependencias.registrarError("Error en crearPrenda:", error);
      if ((error as { code?: string })?.code === "P2002") {
        return { error: "El SKU ingresado ya pertenece a otra variante." };
      }
      await dependencias.eliminarImagenes(idsPublicosSubidos, tenantId);
      const idPrendaAEliminar = idPrenda;
      if (idPrendaAEliminar) {
        try {
          await dependencias.conPrisma((prisma) =>
            dependencias.eliminarRegistroPrenda(prisma, tenantId, idPrendaAEliminar),
          );
        } catch {
          console.error("No se pudo eliminar el producto tras un error de imágenes.");
        }
      }
      return { error: "No se pudo crear el producto. Revisá los datos e intentá nuevamente." };
    }
  };
}
