import "server-only";

import { prisma } from "@/lib/prisma";

export type ItemParaCrearPedido = {
  productId: string | number;
  variantId: string | number;
  cantidad: number;
};

export type ResultadoCrearPedido = {
  pedidoId: string;
  total: number;
  moneda: string;
};

type ItemPreparado = {
  tenantId: string;
  garmentId: string;
  variantId: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
};

/**
 * Crea un pedido a partir de los ítems del carrito, recalculando los precios y
 * validando el stock en el servidor (el total que llega del cliente se ignora).
 * Requiere que quien lo llama ya haya validado la sesión del comprador.
 */
export async function crearPedidoDesdeCarrito(
  tenantId: string,
  userId: string,
  items: ItemParaCrearPedido[],
): Promise<ResultadoCrearPedido> {
  if (!items.length) throw new Error("El carrito está vacío");

  const pageConfig = await prisma.pageConfig.findFirst({
    where: { tenantId },
    select: { currency: true },
  });
  const moneda = pageConfig?.currency ?? "ARS";

  const itemsPreparados: ItemPreparado[] = [];
  let total = 0;

  for (const item of items) {
    if (!Number.isInteger(item.cantidad) || item.cantidad < 1) {
      throw new Error("La cantidad de un ítem no es válida");
    }

    const variante = await prisma.garmentVariant.findFirst({
      where: { id: String(item.variantId), tenantId, garmentId: String(item.productId) },
      include: { garment: { select: { name: true, price: true, controlaStock: true } } },
    });

    if (!variante) throw new Error("Uno de los productos ya no está disponible");

    if (variante.garment.controlaStock && item.cantidad > variante.stock) {
      throw new Error(`Stock insuficiente para un producto (${variante.stock} disponibles)`);
    }

    const precioUnitario = Number(variante.priceOverride ?? variante.garment.price);

    itemsPreparados.push({
      tenantId,
      garmentId: String(item.productId),
      variantId: String(item.variantId),
      nombre: variante.garment.name,
      precioUnitario,
      cantidad: item.cantidad,
      subtotal: precioUnitario * item.cantidad,
    });

    total += precioUnitario * item.cantidad;
  }

  if (total <= 0) throw new Error("El total del pedido es inválido");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  const pedido = await prisma.pedido.create({
    data: {
      tenantId,
      userId,
      total,
      moneda,
      nombreCliente: user?.name ?? null,
      emailCliente: user?.email ?? null,
      items: { create: itemsPreparados },
    },
  });

  return { pedidoId: pedido.id, total, moneda };
}
