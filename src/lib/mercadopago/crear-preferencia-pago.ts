import "server-only";

import { Preference } from "mercadopago";
import { conPrismaTenant } from "@/lib/prisma";
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
  reservaExpiraEn: Date,
): Promise<ResultadoCrearPreferencia> {
  const pedido = await conPrismaTenant(tenantId, (prisma) =>
    prisma.pedido.findFirst({
      where: { id: pedidoId },
      include: { items: { where: {} } },
    }),
  );

  if (!pedido) {
    throw new Error(`Pedido ${pedidoId} no encontrado`);
  }
  if (
    pedido.estado !== "PENDIENTE" ||
    !pedido.stockReservado ||
    !pedido.reservaExpiraEn ||
    pedido.reservaExpiraEn.getTime() !== reservaExpiraEn.getTime() ||
    reservaExpiraEn <= new Date()
  ) {
    throw new Error("La reserva del pedido venció antes de iniciar el checkout");
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
      reservaExpiraEn,
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

  const actualizado = await conPrismaTenant(tenantId, (prisma) =>
    prisma.pedido.updateMany({
      where: {
        id: pedido.id,
        estado: "PENDIENTE",
        stockReservado: true,
        reservaExpiraEn: { equals: reservaExpiraEn, gt: new Date() },
      },
      data: { mpPreferenceId: respuesta.id },
    }),
  );
  if (actualizado.count !== 1) {
    throw new Error("La reserva venció mientras se iniciaba el checkout");
  }

  const checkout = obtenerUrlCheckout(respuesta, tokenAcceso);

  return {
    preferenceId: respuesta.id,
    checkoutUrl: checkout.url,
    esSandbox: checkout.esSandbox,
  };
}
