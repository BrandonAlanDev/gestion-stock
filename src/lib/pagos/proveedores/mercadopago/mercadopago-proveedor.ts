import "server-only";

import { MerchantOrder, Payment } from "mercadopago";
import { crearPreferenciaPago } from "@/lib/mercadopago/crear-preferencia-pago";
import { eliminarCuentaMP } from "@/lib/mercadopago/eliminar-cuenta";
import { guardarCuentaMP } from "@/lib/mercadopago/guardar-cuenta";
import { intercambiarCodigoPorToken } from "@/lib/mercadopago/intercambiar-codigo";
import { obtenerCredencialesMP } from "@/lib/mercadopago/obtener-credenciales";
import { obtenerEstadoCuentaMP } from "@/lib/mercadopago/obtener-estado-cuenta";
import type {
  DatosCrearPago,
  DatosEstadoPago,
  EstadoProveedor,
  PaymentProvider,
  ResultadoCrearPago,
  ResultadoEstadoPago,
} from "@/lib/pagos/tipos";

/**
 * Implementación de PaymentProvider para Mercado Pago (Checkout Pro + OAuth).
 * Encapsula toda la integración técnica con Mercado Pago bajo la interfaz
 * común, de modo que el checkout y la configuración no conozcan detalles de MP.
 */
export const proveedorMercadoPago: PaymentProvider = {
  id: "mercadopago",

  async obtenerEstado(tenantId: string): Promise<EstadoProveedor> {
    return obtenerEstadoCuentaMP(tenantId);
  },

  async desconectar(tenantId: string): Promise<void> {
    await eliminarCuentaMP(tenantId);
  },

  async obtenerUrlConexion(): Promise<string> {
    // El flujo OAuth de Mercado Pago maneja PKCE y cookies httpOnly, por lo que
    // se inicia desde /api/mercadopago/oauth/start y no desde aquí.
    throw new Error(
      "El flujo OAuth de Mercado Pago se inicia desde /api/mercadopago/oauth/start",
    );
  },

  async manejarCallback(
    tenantId: string,
    codigo: string,
    codeVerifier: string,
  ): Promise<void> {
    const tokens = await intercambiarCodigoPorToken(codigo, codeVerifier);
    await guardarCuentaMP(tenantId, tokens, { conectado: true });
  },

  async crearPago(datos: DatosCrearPago): Promise<ResultadoCrearPago> {
    if (!datos.reservaExpiraEn) {
      throw new Error("Mercado Pago requiere una fecha de expiración de la reserva");
    }
    const { preferenceId, checkoutUrl, esSandbox } = await crearPreferenciaPago(
      datos.pedidoId,
      datos.tenantId,
      datos.baseUrl,
      datos.reservaExpiraEn,
    );

    return {
      externalId: preferenceId,
      checkoutUrl,
      instrucciones: null,
      esSandbox,
      estado: "PENDIENTE",
    };
  },

  async obtenerEstadoPago(
    tenantId: string,
    datos: DatosEstadoPago,
  ): Promise<ResultadoEstadoPago> {
    const { cliente } = await obtenerCredencialesMP(tenantId);
    const payment = new Payment(cliente);
    const pago = await payment.get({ id: datos.externalId });
    if (!pago.id || !pago.order?.id) {
      throw new Error("El pago no tiene una orden comercial verificable");
    }
    const orden = await new MerchantOrder(cliente).get({ merchantOrderId: pago.order.id });
    if (!orden.preference_id ||
        !orden.payments?.some((asociado) => String(asociado.id) === String(pago.id))) {
      throw new Error("El pago no pertenece a una preferencia verificable");
    }

    return {
      estadoExterno: String(pago.status ?? ""),
      montoPago: Number(pago.transaction_amount ?? 0) || null,
      monedaPago: pago.currency_id ? String(pago.currency_id) : null,
      referencia: pago.external_reference ? String(pago.external_reference) : null,
      externalId: String(pago.id),
      preferenceId: orden.preference_id,
    };
  },
};
