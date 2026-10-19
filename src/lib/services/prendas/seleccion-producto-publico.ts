import { Prisma } from "@/../generated/prisma/client";

export const SELECCION_PRODUCTO_PUBLICO = {
  id: true,
  name: true,
  price: true,
  maxPrice: true,
  description: true,
  active: true,
  createdAt: true,
  etiquetas: true,
  controlaStock: true,
  category: { select: { name: true } },
  subCategory: { select: { id: true, name: true } },
  images: {
    select: { id: true, srcImage: true, alt: true, order: true },
    orderBy: { order: "asc" },
  },
  variants: {
    select: {
      id: true,
      stock: true,
      sku: true,
      priceOverride: true,
      size: { select: { id: true, value: true } },
      color: { select: { id: true, name: true, hex: true } },
      optionValues: {
        select: {
          optionValue: {
            select: { value: true, option: { select: { name: true } } },
          },
        },
      },
    },
  },
  opciones: {
    select: {
      id: true,
      name: true,
      values: { select: { id: true, value: true } },
    },
    orderBy: { position: "asc" },
  },
} satisfies Prisma.GarmentSelect;
