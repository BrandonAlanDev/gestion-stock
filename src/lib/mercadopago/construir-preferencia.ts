export interface PedidoParaPreferencia {
  id: string;
  moneda: string;
  total: number;
  nombreCliente: string | null;
  emailCliente: string | null;
  items: Array<{
    nombre: string;
    cantidad: number;
    precioUnitario: number;
  }>;
}

/** Construye el cuerpo de la preferencia de pago (Checkout Pro) para un pedido. */
export function construirPreferenciaPago(
  pedido: PedidoParaPreferencia,
  baseUrl: string,
  tenantId: string,
) {
  const items = pedido.items.map((item, indice) => ({
    id: `item-${indice}`,
    title: item.nombre,
    description: item.nombre,
    quantity: item.cantidad,
    unit_price: item.precioUnitario,
    currency_id: pedido.moneda,
  }));

  return {
    items,
    payer: {
      name: pedido.nombreCliente ?? "Cliente",
      email: pedido.emailCliente ?? undefined,
    },
    back_urls: {
      success: `${baseUrl}/pago/exito?pedidoId=${pedido.id}`,
      failure: `${baseUrl}/pago/error?pedidoId=${pedido.id}`,
      pending: `${baseUrl}/pago/pendiente?pedidoId=${pedido.id}`,
    },
    auto_return: "approved",
    notification_url: `${baseUrl}/api/mercadopago/webhook?tenantId=${tenantId}`,
    external_reference: pedido.id,
    metadata: { pedidoId: pedido.id, tenantId },
    expires: true,
    expiration_date_from: new Date().toISOString(),
    expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}
