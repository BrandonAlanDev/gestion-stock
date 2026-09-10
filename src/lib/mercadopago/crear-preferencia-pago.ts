import "server-only";

import { Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { construirPreferenciaPago } from "./construir-preferencia";
import { obtenerClienteMP } from "./obtener-cliente";
import { obtenerTokenAccesoMP } from "./obtener-token-acceso";
import { obtenerUrlCheckout } from "./url-checkout";

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

  if (!pedido || pedido.tenantId !== tenantId) {
    throw new Error("Pedido no encontrado");
  }

  const mp = await obtenerClienteMP(tenantId);
  const preference = new Preference(mp);

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
    throw new Error("No se pudo crear la preferencia de pago");
  }

  await prisma.pedido.update({
    where: { id: pedidoId },
    data: { mpPreferenceId: respuesta.id },
  });

  const tokenAcceso = await obtenerTokenAccesoMP(tenantId);
  const checkout = obtenerUrlCheckout(respuesta, tokenAcceso);

  return {
    preferenceId: respuesta.id,
    checkoutUrl: checkout.url,
    esSandbox: checkout.esSandbox,
  };
}
