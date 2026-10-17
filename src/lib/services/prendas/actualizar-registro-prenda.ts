import { Prisma } from "@/../generated/prisma/client";
import type { PrismaClient } from "@/../generated/prisma/client";
import type { DatosGuardarProducto } from "@/types/productos/opciones-producto";
import { sincronizarOpciones } from "@/lib/services/prendas/sincronizar-opciones";
import { crearVinculosVariante } from "@/lib/services/prendas/crear-vinculos-variante";
import { validarReferenciasVariantes } from "@/lib/services/prendas/validar-referencias-variantes";

export async function actualizarRegistroPrendaConDetalles(
  prisma: PrismaClient,
  tenantId: string,
  id: string,
  datos: DatosGuardarProducto
) {
  const producto = await prisma.garment.findFirst({ where: { id }, select: { id: true, cost: true } });
  if (!producto) throw new Error("Producto no encontrado");
  const categoria = await prisma.category.findFirst({ where: { id: datos.categoryId }, select: { id: true } });
  if (!categoria) throw new Error("Categoría no encontrada");
  if (datos.subCategoryId) {
    const subcategoria = await prisma.subCategory.findFirst({ where: { id: datos.subCategoryId, categoryId: datos.categoryId }, select: { id: true } });
    if (!subcategoria) throw new Error("Subcategoría no encontrada");
  }
  if (datos.supplierId) {
    const proveedor = await prisma.provider.findFirst({ where: { id: datos.supplierId }, select: { id: true } });
    if (!proveedor) throw new Error("Proveedor no encontrado");
  }
  await validarReferenciasVariantes(prisma, tenantId, datos.variants);

  const cost = typeof datos.cost === "number" && !Number.isNaN(datos.cost) ? datos.cost : producto.cost;

  await prisma.$transaction(
    async (tx) => {
      await tx.garment.updateMany({
        where: { id },
        data: {
          name: datos.name,
          price: datos.price,
          maxPrice: datos.maxPrice,
          cost,
          description: datos.description ?? "",
          categoryId: datos.categoryId,
          subCategoryId: datos.subCategoryId || null,
          supplierId: datos.supplierId || null,
          controlaStock: datos.controlaStock,
          active: datos.activo,
          etiquetas: datos.etiquetas.length ? (datos.etiquetas as Prisma.InputJsonValue) : Prisma.DbNull,
        },
      });

      const resolver = await sincronizarOpciones(tx, tenantId, id, datos.opciones);

      const variantesActuales = await tx.garmentVariant.findMany({ where: { garmentId: id } });
      const idsEntrantes = datos.variants.filter((v) => v.id).map((v) => v.id as string);
      const idsActuales = new Set(variantesActuales.map((variante) => variante.id));
      if (idsEntrantes.some((idVariante) => !idsActuales.has(idVariante))) {
        throw new Error("La variante no pertenece al producto");
      }
      const idsAEliminar = variantesActuales.filter((v) => !idsEntrantes.includes(v.id)).map((v) => v.id);
      if (idsAEliminar.length > 0) {
        await tx.garmentVariant.deleteMany({ where: { id: { in: idsAEliminar } } });
      }

      for (const variante of datos.variants) {
        const data = {
          stock: variante.stock,
          sku: variante.sku || null,
          priceOverride: variante.priceOverride,
          sizeId: variante.sizeId || null,
          colorId: variante.colorId || null,
          attributes: variante.attributes === null ? Prisma.JsonNull : variante.attributes,
        };
        if (variante.id) {
          await tx.garmentVariant.updateMany({ where: { id: variante.id, garmentId: id }, data });
          await tx.garmentVariantOptionValue.deleteMany({ where: { variantId: variante.id } });
          await crearVinculosVariante(tx, variante.id, resolver, variante.opcionValores);
        } else {
          const creadaVariante = await tx.garmentVariant.create({
            data: {
              garmentId: id,
              stock: variante.stock,
              sku: variante.sku || null,
              priceOverride: variante.priceOverride,
              sizeId: variante.sizeId || null,
              colorId: variante.colorId || null,
              attributes: variante.attributes === null ? Prisma.JsonNull : variante.attributes,
            },
          });
          await crearVinculosVariante(tx, creadaVariante.id, resolver, variante.opcionValores);
        }
      }
    },
    { timeout: 60000, maxWait: 60000 }
  );

  await prisma.garmentImage.deleteMany({ where: { garmentId: id } });
  if (datos.images.length > 0) {
    await prisma.garmentImage.createMany({
      data: datos.images.map(({ url, publicId, order }) => ({
        garmentId: id,
        srcImage: url,
        publicId: publicId ?? null,
        order,
      })),
    });
  }

  return prisma.garment.findFirst({ where: { id } });
}
