import { prisma } from "@/lib/prisma";
import { Prisma } from "@/../generated/prisma/client";
import type { DatosGuardarProducto } from "@/types/productos/opciones-producto";
import { sincronizarOpciones } from "@/lib/services/prendas/sincronizar-opciones";
import { crearVinculosVariante } from "@/lib/services/prendas/crear-vinculos-variante";
import { validarReferenciasVariantes } from "@/lib/services/prendas/validar-referencias-variantes";

export async function crearRegistroPrenda(tenantId: string, datos: DatosGuardarProducto) {
  const categoria = await prisma.category.findFirst({ where: { id: datos.categoryId, tenantId }, select: { id: true } });
  if (!categoria) throw new Error("Categoría no encontrada");
  if (datos.subCategoryId) {
    const subcategoria = await prisma.subCategory.findFirst({ where: { id: datos.subCategoryId, categoryId: datos.categoryId, tenantId }, select: { id: true } });
    if (!subcategoria) throw new Error("Subcategoría no encontrada");
  }
  if (datos.supplierId) {
    const proveedor = await prisma.provider.findFirst({ where: { id: datos.supplierId, tenantId }, select: { id: true } });
    if (!proveedor) throw new Error("Proveedor no encontrado");
  }
  await validarReferenciasVariantes(tenantId, datos.variants);

  const id = await prisma.$transaction(
    async (tx) => {
      const creado = await tx.garment.create({
        data: {
          tenantId,
          name: datos.name,
          price: datos.price,
          maxPrice: datos.maxPrice,
          cost: datos.cost,
          description: datos.description || null,
          categoryId: datos.categoryId,
          subCategoryId: datos.subCategoryId || null,
          supplierId: datos.supplierId || null,
          controlaStock: datos.controlaStock,
          active: datos.activo,
          etiquetas: datos.etiquetas.length ? (datos.etiquetas as Prisma.InputJsonValue) : Prisma.DbNull,
        },
      });
      const resolver = await sincronizarOpciones(tx, tenantId, creado.id, datos.opciones);
      for (const variante of datos.variants) {
        const creadaVariante = await tx.garmentVariant.create({
          data: {
            tenantId,
            garmentId: creado.id,
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
      return creado.id;
    },
    { timeout: 60000, maxWait: 60000 }
  );

  return prisma.garment.findUniqueOrThrow({ where: { id } });
}
