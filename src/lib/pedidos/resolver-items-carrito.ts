import "server-only";

import type { PrismaClient } from "@/../generated/prisma/client";

export type ItemParaCrearPedido = {
  productId: string | number;
  variantId: string | number;
  cantidad: number;
};

export type ItemPreparado = {
  garmentId: string;
  variantId: string;
  nombre: string;
  varianteNombre: string | null;
  varianteDetalle: string | null;
  imagen: string | null;
  precioUnitario: number;
  precioAnterior: number | null;
  cantidad: number;
  subtotal: number;
};

/** Resuelve en el tenant activo los datos, precios y stock de las variantes del carrito. */
export async function resolverItemsCarrito(
  prisma: PrismaClient,
  items: ItemParaCrearPedido[],
): Promise<ItemPreparado[]> {
  if (!items.length) throw new Error("El carrito está vacío");

  const cantidadesPorVariante = new Map<string, { productId: string; cantidad: number }>();
  for (const item of items) {
    if (!Number.isInteger(item.cantidad) || item.cantidad < 1) {
      throw new Error("La cantidad de un ítem no es válida");
    }

    const variantId = String(item.variantId);
    const productId = String(item.productId);
    const anterior = cantidadesPorVariante.get(variantId);
    if (anterior && anterior.productId !== productId) {
      throw new Error("Una variante pertenece a productos distintos");
    }
    cantidadesPorVariante.set(variantId, {
      productId,
      cantidad: (anterior?.cantidad ?? 0) + item.cantidad,
    });
  }

  for (const item of cantidadesPorVariante.values()) {
    if (!Number.isSafeInteger(item.cantidad)) {
      throw new Error("La cantidad de un ítem no es válida");
    }
  }

  // Una sola consulta para todas las variantes; la pertenencia al producto se valida después.
  const variantes = await prisma.garmentVariant.findMany({
    where: {
      id: { in: [...cantidadesPorVariante.keys()] },
      garment: { active: true },
    },
    include: {
      garment: {
        select: {
          name: true,
          price: true,
          maxPrice: true,
          controlaStock: true,
          images: {
            orderBy: { order: "asc" },
            take: 1,
            select: { srcImage: true },
          },
        },
      },
      optionValues: {
        include: {
          optionValue: {
            include: { option: { select: { name: true } } },
          },
        },
      },
    },
  });
  const variantesPorId = new Map(variantes.map((variante) => [variante.id, variante]));

  const preparados: ItemPreparado[] = [];
  for (const [variantId, item] of cantidadesPorVariante) {
    const encontrada = variantesPorId.get(variantId);
    const variante = encontrada?.garmentId === item.productId ? encontrada : undefined;

    if (!variante) throw new Error("Uno de los productos ya no está disponible");
    if (variante.garment.controlaStock && item.cantidad > variante.stock) {
      throw new Error(`Stock insuficiente para un producto (${variante.stock} disponibles)`);
    }

    const precioUnitario = Number(variante.priceOverride ?? variante.garment.price);
    const precioAnterior = variante.garment.maxPrice == null
      ? null
      : Number(variante.garment.maxPrice);
    const opciones = variante.optionValues.map(({ optionValue }) => ({
      nombre: optionValue.option.name,
      valor: optionValue.value,
    }));
    preparados.push({
      garmentId: item.productId,
      variantId,
      nombre: variante.garment.name,
      varianteNombre: opciones.map(({ valor }) => valor).join(" · ") || null,
      varianteDetalle: opciones.map(({ nombre, valor }) => `${nombre}: ${valor}`).join(" · ") || null,
      imagen: variante.garment.images[0]?.srcImage ?? null,
      precioUnitario,
      precioAnterior: precioAnterior !== null && precioAnterior > precioUnitario
        ? precioAnterior
        : null,
      cantidad: item.cantidad,
      subtotal: precioUnitario * item.cantidad,
    });
  }

  return preparados;
}
