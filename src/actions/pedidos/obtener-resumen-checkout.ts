"use server";

import { z } from "zod";
import { conPrisma } from "@/lib/prisma";
import { ErrorItemCarrito, resolverItemsCarrito } from "@/lib/pedidos/resolver-items-carrito";
import { construirResumenCheckout } from "@/lib/pedidos/construir-resumen-checkout";
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
})).min(1).max(50);

function obtenerMensajeValidacion(error: unknown): string {
  if (!(error instanceof Error)) return "No se pudo validar el resumen del pedido.";
  if (error instanceof ErrorItemCarrito) return error.message;
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
      const itemsPedido: ItemParaCrearPedido[] = validacion.data.map(({ clave, productId, variantId, cantidad }) => ({
        clave,
        productId,
        variantId,
        cantidad,
      }));
      const preparados = await resolverItemsCarrito(prisma, itemsPedido);

      const pageConfig = await prisma.pageConfig.findUnique({
        where: { clave: "principal" },
        select: { currency: true },
      });
      const resumen = construirResumenCheckout(
        itemsPedido,
        preparados,
        pageConfig?.currency ?? "ARS",
      );
      if (resumen.subtotal <= 0) throw new Error("El total del pedido es inválido");

      return {
        ok: true as const,
        ...resumen,
      };
    });
  } catch (error) {
    return {
      ok: false,
      error: obtenerMensajeValidacion(error),
    };
  }
}
