import "server-only";

import { Payment, WebhookSignatureValidator } from "mercadopago";
import type { NextRequest } from "next/server";
import { crearPreferenciaPago } from "@/lib/mercadopago/crear-preferencia-pago";
import { eliminarCuentaMP } from "@/lib/mercadopago/eliminar-cuenta";
import { guardarCuentaMP } from "@/lib/mercadopago/guardar-cuenta";
import { intercambiarCodigoPorToken } from "@/lib/mercadopago/intercambiar-codigo";
import { obtenerClienteMP } from "@/lib/mercadopago/obtener-cliente";
import { obtenerCuentaMP } from "@/lib/mercadopago/obtener-cuenta";
import { obtenerNombreCuentaMP } from "@/lib/mercadopago/obtener-nombre-cuenta";
import type {
  DatosCrearPago,
  DatosEstadoPago,
  EstadoProveedor,
  PaymentProvider,
  ResultadoCrearPago,
  ResultadoEstadoPago,
  ResultadoWebhook,
} from "@/lib/pagos/tipos";

/**
 * Implementación de PaymentProvider para Mercado Pago (Checkout Pro + OAuth).
 * Encapsula toda la integración técnica con Mercado Pago bajo la interfaz
 * común, de modo que el checkout y la configuración no conozcan detalles de MP.
 */
export const proveedorMercadoPago: PaymentProvider = {
  id: "mercadopago",

  async obtenerEstado(tenantId: string): Promise<EstadoProveedor> {
    try {
      const cuenta = await obtenerCuentaMP(tenantId);
      if (!cuenta?.conectado) {
        return { conectado: false, nombreCuenta: null, actualizadoEn: null };
      }
      const nombreCuenta = await obtenerNombreCuentaMP(tenantId);
      return {
        conectado: true,
        nombreCuenta,
        actualizadoEn: cuenta.updatedAt.toISOString(),
      };
    } catch {
      return { conectado: false, nombreCuenta: null, actualizadoEn: null };
    }
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
    const { preferenceId, checkoutUrl, esSandbox } = await crearPreferenciaPago(
      datos.pedidoId,
      datos.tenantId,
      datos.baseUrl,
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
    const mp = await obtenerClienteMP(tenantId);
    const payment = new Payment(mp);
    const pago = await payment.get({ id: datos.externalId });

    return {
      estadoExterno: String(pago.status ?? ""),
      montoPago: Number(pago.transaction_amount ?? 0) || null,
      referencia: pago.external_reference ? String(pago.external_reference) : null,
      externalId: String(pago.id),
    };
  },
};

/** Valida la firma X-Signature de un webhook de Mercado Pago (fail-closed en prod). */
function firmaValida(req: NextRequest, paymentId: string): boolean {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "MP_WEBHOOK_SECRET no configurado: se rechazó la firma del webhook (fail-closed).",
      );
      return false;
    }
    console.warn("MP_WEBHOOK_SECRET no configurado: no se verificó la firma del webhook.");
    return true;
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId: req.nextUrl.searchParams.get("data.id") ?? paymentId,
      secret: secreto,
      toleranceSeconds: 5 * 60,
    });
    return true;
  } catch (error) {
    console.error(
      "Firma inválida en webhook para paymentId:",
      paymentId,
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}

/** Extrae el paymentId del cuerpo de notificación (formatos moderno y IPN clásico). */
function extraerPaymentId(requerimiento: NextRequest, cuerpo: Record<string, unknown>): string | null {
  const idDirecto = cuerpo?.data as Record<string, unknown> | undefined;
  if (idDirecto?.id) return String(idDirecto.id);
  if (cuerpo?.topic === "payment" && cuerpo?.id) return String(cuerpo.id);
  return null;
}

/**
 * Procesa una notificación de Mercado Pago: extrae el id, valida la firma y
 * consulta el estado real del pago. Devuelve un resultado normalizado para que
 * la capa compartida actualice Payment + Pedido (idempotente).
 */
export async function procesarWebhookMP(req: NextRequest): Promise<ResultadoWebhook> {
  const cuerpo = (await req.json()) as Record<string, unknown>;

  const paymentId = extraerPaymentId(req, cuerpo);
  if (!paymentId) {
    console.log("Webhook MP sin paymentId. Tipo:", cuerpo?.type || cuerpo?.topic);
    return { tipo: "ignorar" };
  }

  const tenantId = req.nextUrl.searchParams.get("tenantId");
  if (!tenantId) {
    console.error("Webhook MP sin tenantId para paymentId:", paymentId);
    return { tipo: "ignorar" };
  }

  if (!firmaValida(req, paymentId)) {
    throw new Error("Firma inválida");
  }

  const pago = await proveedorMercadoPago.obtenerEstadoPago(tenantId, {
    externalId: paymentId,
  });

  return {
    tipo: "pago",
    pago: {
      externalId: pago.externalId,
      pedidoId: pago.referencia,
      estadoExterno: pago.estadoExterno,
      montoPago: pago.montoPago,
    },
  };
}
