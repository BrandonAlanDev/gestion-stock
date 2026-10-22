"use server";

import { z } from "zod";
import { conPrisma } from "@/lib/prisma";
import { resolverItemsCarrito } from "@/lib/pedidos/resolver-items-carrito";
import type { ItemParaCrearPedido } from "@/lib/pedidos/resolver-items-carrito";
import type { ResumenCheckout } from "@/lib/pedidos/tipos-resumen-checkout";

const identificador = z.union([
  z.string().min(1).max(100),
  z.number().int().positive(),
]);

const esquemaItems = z.array(z.object({
  clave: z.string().min(1).max(200),
  productId: identificador,
  variantId: identificador,
  cantidad: z.number().int().positive().max(1000),
})).min(1).max(100);

function obtenerMensajeValidacion(error: unknown): string {
  if (!(error instanceof Error)) return "No se pudo validar el resumen del pedido.";
  if (error.message.startsWith("Stock insuficiente para un producto")) return error.message;
  if ([
    "El carrito está vacío",
    "La cantidad de un ítem no es válida",
    "Una variante pertenece a productos distintos",
    "Uno de los productos ya no está disponible",
    "El total del pedido es inválido",
  ].includes(error.message)) return error.message;
  return "No se pudo validar el resumen del pedido. Intentá nuevamente.";
}

/** Devuelve un resumen calculado con los precios y el stock actuales del tenant. */
export async function obtenerResumenCheckout(entrada: unknown): Promise<
  | ({ ok: true } & ResumenCheckout)
  | { ok: false; error: string }
> {
  const validacion = esquemaItems.safeParse(entrada);
  if (!validacion.success) {
    return { ok: false, error: "No se pudo validar el contenido del carrito." };
  }

  try {
    return await conPrisma(async (prisma) => {
      const itemsPedido: ItemParaCrearPedido[] = validacion.data.map(({ productId, variantId, cantidad }) => ({
        productId,
        variantId,
        cantidad,
      }));
      const preparados = await resolverItemsCarrito(prisma, itemsPedido);
      const porVariante = new Map(preparados.map((item) => [item.variantId, item]));
      const items = validacion.data.map((item) => {
        const preparado = porVariante.get(String(item.variantId));
        if (!preparado || preparado.garmentId !== String(item.productId)) {
          throw new Error("Uno de los productos ya no está disponible");
        }
        return {
          clave: item.clave,
          productId: preparado.garmentId,
          variantId: preparado.variantId,
          nombre: preparado.nombre,
          variante: preparado.varianteDetalle,
          imagen: preparado.imagen,
          cantidad: item.cantidad,
          precioUnitario: preparado.precioUnitario,
          precioAnterior: preparado.precioAnterior,
          subtotal: preparado.precioUnitario * item.cantidad,
        };
      });
      const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
      if (subtotal <= 0) throw new Error("El total del pedido es inválido");

      const pageConfig = await prisma.pageConfig.findFirst({
        where: {},
        select: { currency: true },
      });

      return {
        ok: true as const,
        items,
        subtotal,
        moneda: pageConfig?.currency ?? "ARS",
      };
    });
  } catch (error) {
    return {
      ok: false,
      error: obtenerMensajeValidacion(error),
    };
  }
}
