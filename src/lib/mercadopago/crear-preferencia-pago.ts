import "server-only";

import { Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { construirPreferenciaPago } from "@/lib/mercadopago/construir-preferencia";
import { obtenerCredencialesMP } from "@/lib/mercadopago/obtener-credenciales";
import { obtenerUrlCheckout } from "@/lib/mercadopago/url-checkout";
import { validarUrlBase } from "@/lib/mercadopago/validar-url-base";

export type ResultadoCrearPreferencia = {
  preferenceId: string;
  checkoutUrl: string;
  esSandbox: boolean;
};

/**
 * Crea la preferencia de pago en Mercado Pago para un pedido de un comercio,
 * guarda el identificador de preferencia y devuelve la URL del checkout.
 */
export async function crearPreferenciaPago(
  pedidoId: string,
  tenantId: string,
  baseUrl: string,
): Promise<ResultadoCrearPreferencia> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { items: true },
  });

  if (!pedido) {
    throw new Error(`Pedido ${pedidoId} no encontrado`);
  }
  if (pedido.tenantId !== tenantId) {
    throw new Error("El pedido no pertenece al comercio indicado");
  }
  if (pedido.items.length === 0) {
    throw new Error("El pedido no tiene ítems para cobrar");
  }

  validarUrlBase(baseUrl);

  const { cliente, tokenAcceso } = await obtenerCredencialesMP(tenantId);
  const preference = new Preference(cliente);

  const cuerpo = construirPreferenciaPago(
    {
      id: pedido.id,
      moneda: pedido.moneda,
      total: Number(pedido.total),
      nombreCliente: pedido.nombreCliente,
      emailCliente: pedido.emailCliente,
      items: pedido.items.map((item) => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: Number(item.precioUnitario),
      })),
    },
    baseUrl,
    tenantId,
  );

  const respuesta = await preference.create({ body: cuerpo });
  if (!respuesta.id) {
    throw new Error("Mercado Pago no devolvió un identificador de preferencia");
  }

  await prisma.pedido.update({
    where: { id: pedido.id },
    data: { mpPreferenceId: respuesta.id },
  });

  const checkout = obtenerUrlCheckout(respuesta, tokenAcceso);

  return {
    preferenceId: respuesta.id,
    checkoutUrl: checkout.url,
    esSandbox: checkout.esSandbox,
  };
}
