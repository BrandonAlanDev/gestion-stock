"use server";

import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrisma } from "@/lib/prisma";

export async function obtenerPrendaParaEdicion(id: string) {
  await requiereAdmin();
  const producto = await conPrisma((prisma) => prisma.garment.findFirst({
    where: { id },
    include: {
      images: { where: {}, orderBy: { order: "asc" } },
      opciones: { where: {}, include: { values: true }, orderBy: { position: "asc" } },
      variants: {
        where: {},
        include: { optionValues: { include: { optionValue: { include: { option: true } } } } },
      },
    },
  }));
  if (!producto) return null;

  return {
    id: producto.id,
    name: producto.name,
    price: Number(producto.price),
    maxPrice: producto.maxPrice == null ? null : Number(producto.maxPrice),
    description: producto.description,
    categoryId: producto.categoryId,
    subCategoryId: producto.subCategoryId,
    etiquetas: Array.isArray(producto.etiquetas)
      ? producto.etiquetas.filter((etiqueta): etiqueta is string => typeof etiqueta === "string")
      : [],
    controlaStock: producto.controlaStock,
    activo: producto.active,
    opciones: producto.opciones.map((opcion) => ({
      id: opcion.id,
      name: opcion.name,
      values: [...opcion.values]
        .sort((a, b) => a.position - b.position)
        .map((valor) => ({ id: valor.id, value: valor.value })),
    })),
    variants: producto.variants.map((variante) => ({
      id: variante.id,
      stock: variante.stock,
      stockOriginal: variante.stock,
      sku: variante.sku,
      priceOverride: variante.priceOverride == null ? null : Number(variante.priceOverride),
      opcionValores: variante.optionValues.map((vinculo) => ({
        opcion: vinculo.optionValue.option.name,
        valor: vinculo.optionValue.value,
      })),
    })),
    images: producto.images.map((imagen) => ({ srcImage: imagen.srcImage, publicId: imagen.publicId })),
  };
}
